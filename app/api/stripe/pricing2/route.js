import { NextResponse } from "next/server";
import Stripe from "stripe";
import { models } from "@/lib/db/models/models";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import { checkTrialEligibility } from "@/lib/actions/checkTrialEligibility";
import {
  getPlanPrices,
  getPriceByPlanId,
} from "@/lib/utils/pricing/getPlanPrices";
import { update } from "@/lib/actions/crud";

export async function POST(request) {
  try {
    // Get the authenticated user
    const { mongoUser } = await getMongoUser();
    if (!mongoUser) {
      console.error("User not authenticated");
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    console.log("Authenticated user:", mongoUser._id);

    // Parse request body
    const body = await request.json();
    console.log("Request body:", JSON.stringify(body));

    const { planId, trialDays = 0, metadata = {} } = body;

    if (!planId) {
      console.error("Plan ID is required");
      return NextResponse.json(
        { error: "Plan ID is required" },
        { status: 400 }
      );
    }

    // Parse extra links if provided
    const extraLinks = metadata?.extraLinks
      ? parseInt(metadata.extraLinks, 10)
      : 0;
    console.log(`Extra links requested: ${extraLinks}`);

    // Check if this is an extra links upgrade
    const isExtraLinksUpgrade = metadata?.isExtraLinksUpgrade === "true";
    console.log(
      `Is explicit extra links upgrade (skipping proration): ${isExtraLinksUpgrade}`
    );

    // If trial days were requested, verify eligibility
    if (trialDays > 0) {
      // If extra links are requested, don't allow trial
      if (extraLinks > 0) {
        console.log(
          `Trial requested but extra links (${extraLinks}) also requested - trials not allowed with extra links`
        );
        return NextResponse.json(
          {
            error:
              "Free trials are not available for subscriptions with extra links",
          },
          { status: 403 }
        );
      }

      console.log(`Trial requested (${trialDays} days), checking eligibility`);
      const eligibility = await checkTrialEligibility();

      if (!eligibility.eligible) {
        console.error(
          `User ${mongoUser._id} not eligible for trial: ${eligibility.reason}`
        );
        return NextResponse.json(
          {
            error:
              eligibility.message ||
              "You are not eligible for a free trial at this time.",
          },
          { status: 403 }
        );
      }

      console.log(`User ${mongoUser._id} is eligible for trial`);

      // Immediately mark user as having used a trial to prevent abuse
      try {
        await update({
          col: "users",
          data: { _id: mongoUser._id },
          update: {
            $set: {
              "subscriptionHistory.trialUsed": true,
            },
          },
        });
        console.log(`User ${mongoUser._id} marked as having used trial`);
      } catch (updateError) {
        console.error("Error marking trial as used:", updateError);
        // Continue anyway - this is not critical to block the subscription process
      }
    }

    // Set prices based on plan ID using the utility function with extra links
    const planDetails = getPriceByPlanId(planId, extraLinks);

    // Check if user already has an active subscription
    const existingActiveSubscription = await models.subscriptions2.findOne({
      createdBy: mongoUser._id,
      status: { $in: ["active", "trialing"] },
    });

    // Log the current subscription details for debugging
    if (existingActiveSubscription) {
      console.log("Current subscription details:");
      console.log(`  - planId: ${existingActiveSubscription.planId}`);
      console.log(
        `  - extraLinks: ${existingActiveSubscription.extraLinks || 0}`
      );
      console.log(`  - status: ${existingActiveSubscription.status}`);
    }

    // Allow plan changes even with active subscription
    let isChangingPlan = false;
    if (existingActiveSubscription) {
      // If user is trying to switch to the same plan they already have, block it
      // But allow extra links changes even if plan ID is the same
      if (
        existingActiveSubscription.planId === planId &&
        existingActiveSubscription.extraLinks === extraLinks &&
        !isExtraLinksUpgrade // Skip this check for explicit extra links upgrades
      ) {
        console.error("User already has this exact plan:", planId);
        return NextResponse.json(
          { error: "You are already subscribed to this plan" },
          { status: 400 }
        );
      }

      console.log(
        "User changing plan from",
        existingActiveSubscription.planId,
        "to",
        planId,
        extraLinks > 0 ? `with ${extraLinks} extra links` : ""
      );
      isChangingPlan = true;
    } else {
      // Check if user has used a trial before but doesn't have an active subscription
      const hasUsedTrial = mongoUser.subscriptionHistory?.trialUsed;
      console.log(
        `User with no active subscription, trial used: ${hasUsedTrial}`
      );

      // No need to block subscription for users who've used trials in the past
    }

    // If this is an extra links upgrade, mark the existing subscription for cancellation
    // at period end since we'll be processing that separately through our own client-side logic
    if (isExtraLinksUpgrade && isChangingPlan && existingActiveSubscription) {
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

        console.log(
          `Processing extra links upgrade: ${
            existingActiveSubscription.extraLinks || 0
          } → ${extraLinks}`
        );

        // Cancel the current subscription at period end
        const subscriptionId = existingActiveSubscription.subscriptionId;
        if (subscriptionId) {
          await stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: true,
          });

          console.log(
            `Marked Stripe subscription ${subscriptionId} for cancellation at period end`
          );

          // Update our database record
          await models.subscriptions2.findByIdAndUpdate(
            existingActiveSubscription._id,
            {
              cancelAtPeriodEnd: true,
              cancelReason: "plan_change",
              newPlanId: planId,
            }
          );

          console.log(
            `Updated subscription ${existingActiveSubscription._id} in our database`
          );
        }
      } catch (error) {
        console.error(
          "Error canceling existing subscription for upgrade:",
          error
        );
        // Continue anyway - we'll create a new subscription
      }
    }

    // Create a pending subscription record first
    let pendingSubscription;
    try {
      // Ensure we have a valid user ID
      if (!mongoUser._id) {
        throw new Error("Invalid user ID");
      }

      const subscriptionData = {
        createdBy: mongoUser._id,
        customerId: isChangingPlan
          ? existingActiveSubscription.customerId
          : "pending",
        subscriptionId: "pending",
        planId: planId,
        extraLinks: extraLinks > 0 ? extraLinks : undefined,
        status: "incomplete",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(),
        metadata: {
          planId,
          extraLinks: extraLinks > 0 ? extraLinks : undefined,
          trialDays,
          isChangingPlan: isChangingPlan,
          previousPlanId: isChangingPlan
            ? existingActiveSubscription.planId
            : null,
          previousSubscriptionId: isChangingPlan
            ? existingActiveSubscription._id.toString()
            : null,
        },
      };

      console.log(
        "Creating subscription with data:",
        JSON.stringify(subscriptionData)
      );

      pendingSubscription = await models.subscriptions2.create(
        subscriptionData
      );
      console.log(
        "Initial subscription record created:",
        pendingSubscription._id
      );
    } catch (subscriptionError) {
      console.error(
        "Error creating initial subscription record:",
        subscriptionError.message
      );
      return NextResponse.json(
        {
          error: "Error creating subscription record",
          details: subscriptionError.message,
        },
        { status: 500 }
      );
    }

    // Verify Stripe key is available
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("Missing STRIPE_SECRET_KEY environment variable");
      return NextResponse.json(
        { error: "Payment service configuration error" },
        { status: 500 }
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Determine base URL for success/cancel redirects
    const baseUrl =
      process.env.NEXT_PUBLIC_CLIENT_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    console.log("Creating Stripe session with base URL:", baseUrl);

    try {
      // Create a checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name:
                  extraLinks > 0
                    ? `${planDetails.name} with ${extraLinks} extra links (${planDetails.totalLinks} total)`
                    : planDetails.name,
                description:
                  extraLinks > 0
                    ? `${planDetails.name} subscription with ${extraLinks} extra links ($1 per extra link)`
                    : `${planDetails.name} subscription with premium features`,
              },
              unit_amount: Math.round(planDetails.price * 100), // Stripe uses cents, ensure integer
              recurring: {
                interval: "month",
              },
            },
            quantity: 1,
          },
        ],
        mode: "subscription",
        subscription_data: await getSubscriptionData(
          mongoUser,
          existingActiveSubscription,
          planId,
          trialDays,
          isChangingPlan,
          extraLinks // Pass extraLinks as a separate parameter
        ),
        success_url: `${baseUrl}/pricing?session_id={CHECKOUT_SESSION_ID}&success=true`,
        cancel_url: `${baseUrl}/pricing`,
        metadata: {
          planId: planId,
          createdBy: mongoUser._id.toString(),
          subscriptionId: pendingSubscription._id.toString(),
          trialDays: trialDays.toString(),
          extraLinks: extraLinks.toString(),
          isChangingPlan: isChangingPlan.toString(),
          previousPlanId: isChangingPlan
            ? existingActiveSubscription.planId
            : "",
          previousSubscriptionId: isChangingPlan
            ? existingActiveSubscription._id.toString()
            : "",
          // Add the pending cancellation flags if provided in metadata
          ...(metadata.pendingCancellation
            ? { pendingCancellation: metadata.pendingCancellation }
            : {}),
          ...(metadata.oldSubscriptionId
            ? { oldSubscriptionId: metadata.oldSubscriptionId }
            : {}),
          ...(metadata.cancelReason
            ? { cancelReason: metadata.cancelReason }
            : {}),
        },
        customer_email: mongoUser.email,
      });

      console.log("Stripe session created:", session.id);

      // Update the subscription record with the session ID
      await models.subscriptions2.findByIdAndUpdate(pendingSubscription._id, {
        stripeSessionId: session.id,
      });
      console.log("Subscription record updated with session ID");

      return NextResponse.json({ sessionUrl: session.url });
    } catch (stripeError) {
      console.error("Stripe session creation error:", stripeError.message);

      // Clean up the pending subscription record
      try {
        await models.subscriptions2.findByIdAndDelete(pendingSubscription._id);
        console.log("Cleaned up subscription record after Stripe error");
      } catch (cleanupError) {
        console.error(
          "Error cleaning up subscription record:",
          cleanupError.message
        );
      }

      return NextResponse.json(
        {
          error: "Error creating payment session",
          details: stripeError.message,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Stripe payment error:", error.message, error.stack);
    return NextResponse.json(
      { error: "Error processing payment", details: error.message },
      { status: 500 }
    );
  }
}

async function getSubscriptionData(
  mongoUser,
  existingActiveSubscription,
  newPlanId,
  trialDays,
  isChangingPlan,
  newExtraLinks
) {
  // Check if this is a special extra links upgrade from the metadata
  const isExtraLinksUpgrade =
    existingActiveSubscription?.metadata?.isExtraLinksUpgrade === "true";

  // If not changing plans or adding trial, return simple trial data
  if (!isChangingPlan) {
    return trialDays > 0 ? { trial_period_days: trialDays } : undefined;
  }

  // Get extraLinks value from existing subscription if available
  const oldExtraLinks = existingActiveSubscription.extraLinks || 0;

  // Log the values for debugging
  console.log(
    `Proration calculation: Changing from ${oldExtraLinks} extra links to ${newExtraLinks} extra links`
  );

  // Determine if this is just an extraLinks change on same plan
  const isExtraLinksChangeOnly =
    existingActiveSubscription.planId === newPlanId &&
    newExtraLinks !== oldExtraLinks;

  console.log(
    isExtraLinksChangeOnly
      ? `Changing extraLinks from ${oldExtraLinks} to ${newExtraLinks} on the same plan (${newPlanId})`
      : `Changing plan from ${existingActiveSubscription.planId} to ${newPlanId}`
  );

  // Get previous and new plan prices using utility function
  const oldPlanId = existingActiveSubscription.planId;
  // Include extraLinks in old plan price calculation for accurate proration
  const oldPlan = getPriceByPlanId(oldPlanId, oldExtraLinks);

  // For new plan, include newExtraLinks
  const newPlan = getPriceByPlanId(newPlanId, newExtraLinks);

  const oldPrice = oldPlan.price;
  const newPrice = newPlan.price;

  console.log(
    `Price comparison for proration: OLD plan with ${oldExtraLinks} extra links = $${oldPrice}, NEW plan with ${newExtraLinks} extra links = $${newPrice}`
  );

  console.log(
    isExtraLinksChangeOnly
      ? `Changing extraLinks from ${oldExtraLinks} ($${oldPrice}) to ${newExtraLinks} ($${newPrice})`
      : `Changing plan from ${oldPlanId} ($${oldPrice}) to ${newPlanId} ($${newPrice}) (original plan had ${oldExtraLinks} extra links)`
  );

  // For an extra links upgrade specifically marked, don't use a trial period
  // Instead, charge the user directly for the upgrade
  if (isExtraLinksUpgrade) {
    console.log(
      "Extra links upgrade flag explicitly set - not using a trial period"
    );
    return undefined; // No trial period for explicit upgrades
  }

  // For all other extraLinks changes (both increases and decreases), calculate trial days
  try {
    // Check if the user is currently on a trial
    let isOnTrial = existingActiveSubscription.status === "trialing";
    let remainingDays, totalDaysInPeriod, daysUsed;

    if (isOnTrial) {
      // If user is on trial, calculate remaining trial days
      const now = new Date();
      const trialEnd = new Date(existingActiveSubscription.trialEnd);

      // If trial has already ended, treat as regular subscription
      if (now >= trialEnd) {
        console.log("Trial has ended, treating as regular subscription");
        isOnTrial = false;
      } else {
        // Calculate remaining trial days
        const trialStart = new Date(
          existingActiveSubscription.trialStart ||
            existingActiveSubscription.currentPeriodStart
        );
        totalDaysInPeriod = Math.ceil(
          (trialEnd - trialStart) / (1000 * 60 * 60 * 24)
        );
        daysUsed = Math.ceil((now - trialStart) / (1000 * 60 * 60 * 24));
        remainingDays = Math.max(
          0,
          Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24))
        );

        console.log(
          `User is on trial with ${remainingDays} days remaining out of ${totalDaysInPeriod} total trial days`
        );
      }
    }

    // If not on trial or trial ended, use regular billing cycle calculation
    if (!isOnTrial) {
      const now = new Date();
      const periodEnd = new Date(existingActiveSubscription.currentPeriodEnd);
      const periodStart = new Date(
        existingActiveSubscription.currentPeriodStart
      );
      totalDaysInPeriod = 30; // Assuming 30-day billing cycle

      // Calculate how many days have been used in the current cycle
      daysUsed = Math.ceil((now - periodStart) / (1000 * 60 * 60 * 24));
      remainingDays = Math.max(0, totalDaysInPeriod - daysUsed);

      console.log(
        `Regular subscription has used ${daysUsed} days with ${remainingDays} days remaining out of ${totalDaysInPeriod}`
      );
    }

    if (remainingDays <= 0) {
      console.log("No remaining days, no proration needed");
      return undefined;
    }

    // Calculate unused value using the formula: unusedValue = oldPrice * (remainingDays / totalDaysInPeriod)
    const unusedPercentage = remainingDays / totalDaysInPeriod;
    const unusedValue = oldPrice * unusedPercentage;

    console.log(
      `Unused value calculation: $${oldPrice} * (${remainingDays}/${totalDaysInPeriod}) = $${unusedValue.toFixed(
        2
      )}`
    );

    // Calculate how many days this value buys in the new plan using the formula:
    // trialDays = floor((unusedValue / newPrice) * totalDaysInPeriod)
    let proratedDays = Math.floor((unusedValue / newPrice) * totalDaysInPeriod);

    console.log(
      `Prorated days calculation: floor(($${unusedValue.toFixed(
        2
      )} / $${newPrice}) * ${totalDaysInPeriod}) = ${proratedDays} days`
    );

    // Special case for extraLinks changes with very small day differences
    // When changing to a similar price, ensure at least 1 day of proration
    if (isExtraLinksChangeOnly && proratedDays < 1 && unusedValue > 0) {
      // If there's any credit at all, give at least 1 day
      proratedDays = 1;
      console.log(
        `Small proration adjustment: Setting minimum 1 day for extraLinks change with unusedValue=$${unusedValue.toFixed(
          2
        )}`
      );
    }

    // Cap prorated days to Stripe's maximum of 730 days (2 years)
    const MAX_STRIPE_TRIAL_DAYS = 730;

    if (proratedDays > MAX_STRIPE_TRIAL_DAYS) {
      console.log(
        `Calculated ${proratedDays} prorated days exceeds Stripe's maximum. Capping to ${MAX_STRIPE_TRIAL_DAYS} days.`
      );
      proratedDays = MAX_STRIPE_TRIAL_DAYS;
    }

    // For upgrades, we may need to collect additional payment immediately
    if (newPrice > oldPrice) {
      // If credit covers less than a day, don't bother with prorating
      // But make an exception for extraLinks changes, where we want to prorate even small amounts
      if (proratedDays < 1 && !isExtraLinksChangeOnly) {
        console.log(
          "Upgrade credit too small for proration, no trial period needed"
        );
        return undefined;
      }

      console.log(
        `Upgrade with ${proratedDays} days credit from previous plan`
      );
    } else if (newPrice < oldPrice) {
      console.log(
        `Downgrade with ${proratedDays} days credit from previous plan`
      );
    } else {
      // Same price but different extraLinks (edge case, shouldn't happen with new pricing table)
      console.log(
        `Plan change with same price but different features: ${proratedDays} days credit`
      );
    }

    // Apply prorated days as a trial period if we have at least 1 day
    if (proratedDays > 0) {
      console.log(`Applying ${proratedDays} days as trial period`);
      return {
        trial_period_days: proratedDays,
      };
    }

    return undefined;
  } catch (error) {
    console.error("Error calculating proration:", error);
    return undefined;
  }
}
