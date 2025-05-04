import { NextResponse } from "next/server";
import Stripe from "stripe";
import { models } from "@/lib/db/models/models";
import { update, add } from "@/lib/actions/crud";
import { isValidForReferralEarnings } from "@/lib/utils/referral/calculateReferralEarnings";
import { getPriceByPlanId } from "@/lib/utils/pricing/getPlanPrices";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      console.error("Session ID is required");
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
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

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription", "customer"],
    });
    console.log("Retrieved Stripe session:", sessionId);

    if (session.payment_status !== "paid" && session.status !== "complete") {
      console.error("Payment not completed for session:", sessionId);
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 }
      );
    }

    const {
      planId,
      createdBy,
      subscriptionId,
      isChangingPlan,
      previousPlanId,
      previousSubscriptionId,
      extraLinks,
      pendingCancellation,
      oldSubscriptionId,
      cancelReason,
    } = session.metadata;

    console.log("Session metadata:", {
      planId,
      createdBy,
      subscriptionId,
      isChangingPlan,
      previousPlanId,
      previousSubscriptionId,
      extraLinks,
      pendingCancellation,
      oldSubscriptionId,
      cancelReason,
    });

    // Parse extraLinks to number if it exists
    const extraLinksCount = extraLinks ? parseInt(extraLinks, 10) : 0;

    // Handle pending subscription cancellation if this is a plan/extraLinks change
    // This is the new approach where we cancel after successful checkout
    if (pendingCancellation === "true" && oldSubscriptionId) {
      console.log(
        `Handling pending cancellation for subscription: ${oldSubscriptionId}`
      );

      try {
        // Find the old subscription
        const oldSubscription = await models.subscriptions2.findById(
          oldSubscriptionId
        );

        if (oldSubscription) {
          // Cancel in Stripe if it exists
          if (
            oldSubscription.subscriptionId &&
            oldSubscription.subscriptionId !== "pending"
          ) {
            try {
              await stripe.subscriptions.cancel(oldSubscription.subscriptionId);
              console.log(
                `Canceled old subscription in Stripe: ${oldSubscription.subscriptionId}`
              );
            } catch (stripeCancelError) {
              console.error(
                `Error canceling Stripe subscription: ${stripeCancelError.message}`
              );
              // Continue even if Stripe cancellation fails
            }
          }

          // Determine reason if not explicitly provided
          let reason = cancelReason || "plan_change";
          if (!cancelReason) {
            if (oldSubscription.planId && planId) {
              if (
                oldSubscription.planId.includes("agency") &&
                planId.includes("creator")
              ) {
                reason = "plan_downgrade";
              } else if (
                oldSubscription.planId.includes("creator") &&
                planId.includes("agency")
              ) {
                reason = "plan_upgrade";
              } else if (oldSubscription.planId === planId) {
                // Same plan, must be an extraLinks change
                const oldExtraLinks = oldSubscription.extraLinks || 0;
                if (extraLinksCount > oldExtraLinks) {
                  reason = "extra_links_increase";
                } else if (extraLinksCount < oldExtraLinks) {
                  reason = "extra_links_decrease";
                }
              }
            }
          }

          // Update the old subscription in our database
          await models.subscriptions2.findByIdAndUpdate(oldSubscriptionId, {
            status: "canceled",
            canceledAt: new Date(),
            cancelReason: reason,
            newPlanId: planId,
          });

          console.log(
            `Updated old subscription to canceled status with reason: ${reason}`
          );
        } else {
          console.error(
            `Could not find old subscription: ${oldSubscriptionId}`
          );
        }
      } catch (cancelError) {
        console.error(
          `Error handling subscription cancellation: ${cancelError.message}`
        );
        // Continue with the new subscription even if cancellation fails
      }
    }

    // Handle plan change if needed (legacy approach - kept for backward compatibility)
    const isPlanChange = isChangingPlan === "true";
    if (isPlanChange && previousSubscriptionId) {
      console.log(`Processing plan change from ${previousPlanId} to ${planId}`);

      try {
        // Find the previous subscription
        const previousSubscription = await models.subscriptions2.findById(
          previousSubscriptionId
        );

        if (previousSubscription) {
          // Mark it as being canceled immediately
          console.log(
            `Canceling previous subscription: ${previousSubscription.subscriptionId}`
          );

          // Cancel in Stripe if it exists
          if (
            previousSubscription.subscriptionId &&
            previousSubscription.subscriptionId !== "pending"
          ) {
            try {
              await stripe.subscriptions.cancel(
                previousSubscription.subscriptionId
              );
              console.log(
                `Canceled previous subscription in Stripe: ${previousSubscription.subscriptionId}`
              );
            } catch (stripeCancelError) {
              console.error(
                `Error canceling Stripe subscription: ${stripeCancelError.message}`
              );
              // Continue even if Stripe cancellation fails
            }
          }

          // Determine if this is an upgrade or downgrade
          let cancelReason = "plan_change";
          if (previousPlanId && planId) {
            if (
              previousPlanId.includes("agency") &&
              planId.includes("creator")
            ) {
              cancelReason = "plan_downgrade";
              console.log("Detected downgrade from Agency to Creator plan");
            } else if (
              previousPlanId.includes("creator") &&
              planId.includes("agency")
            ) {
              cancelReason = "plan_upgrade";
              console.log("Detected upgrade from Creator to Agency plan");
            }
          } else if (previousSubscription.cancelReason) {
            // If we already have a reason from the cancelSubscription2AtPeriodEnd function, use it
            cancelReason = previousSubscription.cancelReason;
            console.log(`Using existing cancelReason: ${cancelReason}`);
          }

          // Mark it as canceled in our database
          await models.subscriptions2.findByIdAndUpdate(
            previousSubscriptionId,
            {
              status: "canceled",
              canceledAt: new Date(),
              cancelReason: cancelReason,
              newPlanId: planId, // Store the new plan ID for reference
            }
          );

          console.log(
            `Updated previous subscription to canceled status with reason: ${cancelReason}`
          );
        } else {
          console.error(
            `Could not find previous subscription: ${previousSubscriptionId}`
          );
        }
      } catch (cancelError) {
        console.error(
          `Error handling plan change cancellation: ${cancelError.message}`
        );
        // Continue with the new subscription even if cancellation fails
      }
    }

    // Get subscription details from Stripe
    const subscription = session.subscription;
    const customer = session.customer;

    // Update the subscription record
    let updatedSubscription;
    try {
      // First, try to find by session ID
      updatedSubscription = await models.subscriptions2.findOneAndUpdate(
        { stripeSessionId: sessionId },
        {
          status: subscription.status,
          subscriptionId: subscription.id,
          customerId: customer.id,
          currentPeriodStart: new Date(
            subscription.current_period_start * 1000
          ),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          trialStart: subscription.trial_start
            ? new Date(subscription.trial_start * 1000)
            : null,
          trialEnd: subscription.trial_end
            ? new Date(subscription.trial_end * 1000)
            : null,
          // Store the subscription amount for commission calculations
          amount: subscription.items.data[0].price.unit_amount / 100,
          currency: subscription.currency,
          // Update trial-specific fields
          // ???
          trialDurationDays: session.metadata.trialDays
            ? parseInt(session.metadata.trialDays)
            : 0,
          trialActivated: subscription.status === "trialing",
          // Store extra links information
          extraLinks: extraLinksCount > 0 ? extraLinksCount : undefined,
          // ???
        },
        { new: true }
      );

      if (!updatedSubscription) {
        console.error(
          "Failed to find subscription record for session:",
          sessionId
        );

        // Try to find by subscriptionId from metadata as fallback
        if (subscriptionId) {
          updatedSubscription = await models.subscriptions2.findByIdAndUpdate(
            subscriptionId,
            {
              status: subscription.status,
              subscriptionId: subscription.id,
              customerId: customer.id,
              stripeSessionId: sessionId,
              currentPeriodStart: new Date(
                subscription.current_period_start * 1000
              ),
              currentPeriodEnd: new Date(
                subscription.current_period_end * 1000
              ),
              trialStart: subscription.trial_start
                ? new Date(subscription.trial_start * 1000)
                : null,
              trialEnd: subscription.trial_end
                ? new Date(subscription.trial_end * 1000)
                : null,
              // Store the subscription amount for commission calculations
              amount: subscription.items.data[0].price.unit_amount / 100,
              currency: subscription.currency,
              // Update trial-specific fields
              // ???
              trialDurationDays: session.metadata.trialDays
                ? parseInt(session.metadata.trialDays)
                : 0,
              trialActivated: subscription.status === "trialing",
              // Store extra links information
              extraLinks: extraLinksCount > 0 ? extraLinksCount : undefined,
              // ???
            },
            { new: true }
          );

          if (updatedSubscription) {
            console.log(
              "Updated subscription record using subscriptionId:",
              subscriptionId
            );
          } else {
            console.error(
              "Failed to find subscription record by subscriptionId:",
              subscriptionId
            );
          }
        }
      } else {
        console.log("Updated subscription record:", updatedSubscription._id);
      }

      // Also update user record with subscription information
      await update({
        col: "users",
        data: { _id: createdBy },
        update: {
          subscription: {
            id: subscription.id,
            customerId: customer.id,
            planId: planId,
            status: subscription.status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            updatedAt: new Date(),
          },
          // Always mark trial as used no matter what type of subscription
          "subscriptionHistory.trialUsed": true,
          "subscriptionHistory.currentPlanStartedAt": new Date(),
          // Track plan change if applicable
          ...(isPlanChange && {
            "subscriptionHistory.lastPlanChange": {
              fromPlan: previousPlanId,
              toPlan: planId,
              changedAt: new Date(),
            },
          }),
          ...(!isPlanChange && {
            "subscriptionHistory.currentPlanStartedAt": new Date(),
          }),
        },
        revalidate: "/pricing",
      });
      console.log("Updated user record with subscription information");

      // Process referral commission if applicable
      if (updatedSubscription) {
        await processReferralCommission(updatedSubscription, createdBy);
      }
    } catch (updateError) {
      console.error("Error updating subscription record:", updateError.message);
      // Continue with the redirect even if the update fails
    }

    // Determine the redirect URL with success parameter
    const baseUrl =
      process.env.NEXT_PUBLIC_CLIENT_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    // Redirect to pricing page with session_id parameter
    // The webhook will handle all the actual processing in the background
    return NextResponse.redirect(
      `${baseUrl}/pricing?success=true&session_id=${sessionId}`
    );
  } catch (error) {
    console.error("Error processing redirect:", error.message, error.stack);

    // Determine base URL for redirect
    const baseUrl =
      process.env.NEXT_PUBLIC_CLIENT_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    return NextResponse.redirect(`${baseUrl}/pricing?error=payment_processing`);
  }
}

/**
 * Process referral commission for a successful subscription payment
 * @param {Object} subscription - The subscription record
 * @param {string} userId - The user's MongoDB ID
 */
async function processReferralCommission(subscription, userId) {
  try {
    // Check if subscription is valid for commission
    if (!isValidForReferralEarnings(subscription)) {
      console.log("Subscription is not eligible for referral commission");
      return;
    }

    // Find the user to check if they were referred
    const user = await models.users.findById(userId);
    if (!user || !user.referredBy) {
      console.log("User has no referrer, skipping commission");
      return;
    }

    // Find the referral record
    const referral = await models.referrals.findOne({
      referrerId: user.referredBy,
      referredId: user._id,
    });

    if (!referral) {
      console.log("No referral record found, skipping commission");
      return;
    }

    // Calculate commission amount (20% of subscription amount)
    const commissionPercentage = 20;
    const commissionAmount = (subscription.amount * commissionPercentage) / 100;

    // Create earnings record
    await add({
      col: "referralearnings",
      data: {
        referrerId: user.referredBy,
        referredId: user._id,
        subscriptionId: subscription._id,
        subscriptionAmount: subscription.amount,
        commissionAmount,
        commissionPercentage,
        status: "pending",
        periodStart: subscription.currentPeriodStart,
        periodEnd: subscription.currentPeriodEnd,
      },
    });

    // Update subscription with referral info
    await update({
      col: "subscriptions2",
      data: { _id: subscription._id },
      update: {
        referrerId: user.referredBy,
        referralCode: user.referralCodeUsed,
        referralCommissionPercentage: commissionPercentage,
      },
    });

    // Update referral status if it's the first payment
    if (referral.status === "pending") {
      await update({
        col: "referrals",
        data: { _id: referral._id },
        update: {
          status: "active",
          activatedAt: new Date(),
        },
      });

      // Update referrer stats
      await update({
        col: "users",
        data: { _id: user.referredBy },
        update: {
          $inc: {
            "referralStats.activeReferrals": 1,
            "referralStats.pendingEarnings": commissionAmount,
            "referralStats.totalEarnings": commissionAmount,
          },
        },
      });
    } else {
      // Just update earnings for existing active referrals
      await update({
        col: "users",
        data: { _id: user.referredBy },
        update: {
          $inc: {
            "referralStats.pendingEarnings": commissionAmount,
            "referralStats.totalEarnings": commissionAmount,
          },
        },
      });
    }

    console.log(
      `Processed referral commission of $${commissionAmount} for user ${user.referredBy}`
    );
  } catch (error) {
    console.error("Error processing referral commission:", error);
  }
}
