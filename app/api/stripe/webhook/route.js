import { NextResponse } from "next/server";
import Stripe from "stripe";
import { models } from "@/lib/db/models/models";
import { update, add } from "@/lib/actions/crud";
import { isValidForReferralEarnings } from "@/lib/utils/referral/calculateReferralEarnings";
import { sendErrorToAdmin } from "@/lib/actions/sendErrorToAdmin";

// ! code start webhook handler
export async function POST(req) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    console.error("No Stripe signature found in request headers");
    return NextResponse.json(
      { error: "No Stripe signature found in request" },
      { status: 400 }
    );
  }

  // Check for webhook secret
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  // For local testing with Stripe CLI, use the specific webhook secret from the CLI
  const stripeCliSecret =
    "whsec_1b0e25421be80bb89de849c1f45d6d6558d874a3e0189d0d3912b5ea34300";

  if (!webhookSecret && !stripeCliSecret) {
    console.error("Missing STRIPE_WEBHOOK_SECRET environment variable");
    return NextResponse.json(
      { error: "Webhook configuration error" },
      { status: 500 }
    );
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("Missing STRIPE_SECRET_KEY environment variable");
    return NextResponse.json(
      { error: "Stripe configuration error" },
      { status: 500 }
    );
  }

  let event;
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // First try with the environment variable webhook secret
    try {
      if (webhookSecret) {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      }
    } catch (mainSecretError) {
      console.log("Failed with main webhook secret, trying Stripe CLI secret");

      // If that fails and we're in development, try with the Stripe CLI secret
      if (process.env.NODE_ENV !== "production") {
        try {
          event = stripe.webhooks.constructEvent(
            body,
            signature,
            stripeCliSecret
          );
        } catch (cliSecretError) {
          throw new Error(
            "Webhook signature verification failed with both secrets"
          );
        }
      } else {
        throw mainSecretError;
      }
    }
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    // Send error notification to admin
    // await sendErrorToAdmin({
    //   error: err,
    //   subject: "Stripe Webhook Signature Verification Failed",
    //   context: {
    //     signatureHeader: signature,
    //     eventType: "unknown",
    //   },
    // });
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err.message}` },
      { status: 400 }
    );
  }

  console.log(`Received Stripe webhook event: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object);
        break;
      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`Error handling webhook: ${error.message}`);
    // Send error notification to admin
    // await sendErrorToAdmin({
    //   error,
    //   subject: "Stripe Webhook Handler Error",
    //   context: {
    //     eventType: event.type,
    //     eventId: event.id,
    //     apiVersion: event.api_version,
    //   },
    // });
    return NextResponse.json(
      { error: `Error handling webhook: ${error.message}` },
      { status: 500 }
    );
  }
}

/**
 * Handle checkout.session.completed event
 * This is fired when a customer completes the checkout process
 */
async function handleCheckoutSessionCompleted(session) {
  console.log(`Processing checkout session: ${session.id}`);

  try {
    if (session.payment_status !== "paid" && session.status !== "complete") {
      console.log(`Session ${session.id} not paid or complete, skipping`);
      return;
    }

    // Get metadata from the session
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
    } = session.metadata || {};

    console.log(`Checkout completed for user: ${createdBy}, plan: ${planId}`);

    // Parse extraLinks to number if it exists
    const extraLinksCount = extraLinks ? parseInt(extraLinks, 10) : 0;

    // Handle pending subscription cancellation if this is a plan/extraLinks change
    if (pendingCancellation === "true" && oldSubscriptionId) {
      console.log(`Handling pending cancellation: ${oldSubscriptionId}`);
      await cancelPreviousSubscription(
        oldSubscriptionId,
        planId,
        extraLinksCount,
        cancelReason
      );
    }

    // Handle plan change if needed (legacy approach - kept for backward compatibility)
    const isPlanChange = isChangingPlan === "true";
    if (isPlanChange && previousSubscriptionId) {
      console.log(`Processing plan change from ${previousPlanId} to ${planId}`);
      await cancelPreviousSubscription(
        previousSubscriptionId,
        planId,
        extraLinksCount,
        null
      );
    }

    // Retrieve expanded subscription data
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    let expandedSession;

    try {
      expandedSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ["subscription", "customer"],
      });
    } catch (error) {
      console.error(`Error retrieving expanded session: ${error.message}`);
      // await sendErrorToAdmin({
      //   error,
      //   subject: "Stripe Checkout Session Retrieval Error",
      //   context: {
      //     sessionId: session.id,
      //     userId: createdBy,
      //     planId: planId,
      //   },
      // });
      return;
    }

    const subscription = expandedSession.subscription;
    const customer = expandedSession.customer;

    if (!subscription) {
      console.log(`No subscription found for session ${session.id}`);
      return;
    }

    // Update or create the subscription record
    await updateSubscriptionRecord(
      session.id,
      subscription,
      customer,
      createdBy,
      planId,
      subscriptionId,
      extraLinksCount,
      isPlanChange,
      previousPlanId,
      session.metadata
    );

    console.log(`Successfully processed checkout session: ${session.id}`);
  } catch (error) {
    console.error(`Error handling checkout session: ${error.message}`);
    // await sendErrorToAdmin({
    //   error,
    //   subject: "Stripe Checkout Session Handler Error",
    //   context: {
    //     sessionId: session.id,
    //     paymentStatus: session.payment_status,
    //     sessionStatus: session.status,
    //     metadata: session.metadata,
    //   },
    // });
  }
}

/**
 * Handle customer.subscription.created event
 */
async function handleSubscriptionCreated(subscription) {
  console.log(`New subscription created: ${subscription.id}`);

  try {
    // We mostly handle subscription creation via checkout.session.completed
    // This handler is for subscriptions created outside our checkout flow

    // Get the subscription metadata
    const metadata = subscription.metadata || {};
    const { createdBy, planId, extraLinks } = metadata;

    if (!createdBy || !planId) {
      console.log(`Subscription ${subscription.id} missing required metadata`);
      return;
    }

    // Parse extraLinks if it exists
    const extraLinksCount = extraLinks ? parseInt(extraLinks, 10) : 0;

    // Fetch customer data
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const customer = await stripe.customers.retrieve(subscription.customer);

    // Check if we already have this subscription in our database
    const existingSubscription = await models.subscriptions2.findOne({
      subscriptionId: subscription.id,
    });

    if (existingSubscription) {
      console.log(`Subscription ${subscription.id} already exists in database`);
      return;
    }

    // Create a new subscription record
    await models.subscriptions2.create({
      createdBy,
      customerId: subscription.customer,
      subscriptionId: subscription.id,
      planId,
      extraLinks: extraLinksCount > 0 ? extraLinksCount : undefined,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      trialStart: subscription.trial_start
        ? new Date(subscription.trial_start * 1000)
        : null,
      trialEnd: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null,
      amount: subscription.items.data[0].price.unit_amount / 100,
      currency: subscription.currency,
      trialActivated: subscription.status === "trialing",
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });

    console.log(`Created database record for subscription: ${subscription.id}`);

    // Update user record with subscription information
    await update({
      col: "users",
      data: { _id: createdBy },
      update: {
        subscription: {
          id: subscription.id,
          customerId: subscription.customer,
          planId: planId,
          status: subscription.status,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          updatedAt: new Date(),
        },
        "subscriptionHistory.trialUsed": subscription.status === "trialing",
        "subscriptionHistory.currentPlanStartedAt": new Date(),
      },
      revalidate: "/pricing",
    });

    console.log(`Updated user record with subscription information`);
  } catch (error) {
    console.error(
      `Error handling subscription created event: ${error.message}`
    );
    // await sendErrorToAdmin({
    //   error,
    //   subject: "Stripe Subscription Created Handler Error",
    //   context: {
    //     subscriptionId: subscription.id,
    //     customerId: subscription.customer,
    //     metadata: subscription.metadata,
    //   },
    // });
  }
}

/**
 * Handle customer.subscription.updated event
 */
async function handleSubscriptionUpdated(subscription) {
  console.log(`Subscription updated: ${subscription.id}`);

  try {
    // Find the subscription in our database
    const dbSubscription = await models.subscriptions2.findOne({
      subscriptionId: subscription.id,
    });

    if (!dbSubscription) {
      console.log(`Subscription ${subscription.id} not found in database`);
      return;
    }

    // Update subscription record with new data
    await models.subscriptions2.findByIdAndUpdate(dbSubscription._id, {
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000)
        : dbSubscription.canceledAt,
      trialStart: subscription.trial_start
        ? new Date(subscription.trial_start * 1000)
        : dbSubscription.trialStart,
      trialEnd: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : dbSubscription.trialEnd,
      amount: subscription.items.data[0].price.unit_amount / 100,
      trialActivated: subscription.status === "trialing",
    });

    console.log(`Updated database record for subscription: ${subscription.id}`);

    // Update user record
    await update({
      col: "users",
      data: { _id: dbSubscription.createdBy },
      update: {
        subscription: {
          id: subscription.id,
          customerId: subscription.customer,
          planId: dbSubscription.planId,
          status: subscription.status,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          updatedAt: new Date(),
        },
      },
      revalidate: "/pricing",
    });

    console.log(`Updated user record with subscription information`);

    // If subscription status changed to active from trialing, mark trial as converted
    if (
      dbSubscription.status === "trialing" &&
      subscription.status === "active"
    ) {
      await models.subscriptions2.findByIdAndUpdate(dbSubscription._id, {
        trialConvertedAt: new Date(),
      });
      console.log(
        `Marked trial as converted for subscription: ${subscription.id}`
      );
    }
  } catch (error) {
    console.error(
      `Error handling subscription updated event: ${error.message}`
    );
    // await sendErrorToAdmin({
    //   error,
    //   subject: "Stripe Subscription Updated Handler Error",
    //   context: {
    //     subscriptionId: subscription.id,
    //     customerId: subscription.customer,
    //     status: subscription.status,
    //   },
    // });
  }
}

/**
 * Handle customer.subscription.deleted event
 */
async function handleSubscriptionDeleted(subscription) {
  console.log(`Subscription canceled: ${subscription.id}`);

  try {
    // Find the subscription in our database
    const dbSubscription = await models.subscriptions2.findOne({
      subscriptionId: subscription.id,
    });

    if (!dbSubscription) {
      console.log(`Subscription ${subscription.id} not found in database`);
      return;
    }

    // Update subscription record with canceled status
    await models.subscriptions2.findByIdAndUpdate(dbSubscription._id, {
      status: "canceled",
      canceledAt: new Date(),
      cancelReason: dbSubscription.cancelReason || "user_cancel",
    });

    console.log(
      `Updated database record for canceled subscription: ${subscription.id}`
    );

    // Update user record
    await update({
      col: "users",
      data: { _id: dbSubscription.createdBy },
      update: {
        subscription: {
          id: subscription.id,
          customerId: subscription.customer,
          planId: dbSubscription.planId,
          status: "canceled",
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          updatedAt: new Date(),
        },
      },
      revalidate: "/pricing",
    });

    console.log(`Updated user record for canceled subscription`);
  } catch (error) {
    console.error(
      `Error handling subscription deleted event: ${error.message}`
    );
    // await sendErrorToAdmin({
    //   error,
    //   subject: "Stripe Subscription Deleted Handler Error",
    //   context: {
    //     subscriptionId: subscription.id,
    //     customerId: subscription.customer,
    //   },
    // });
  }
}

/**
 * Handle invoice.payment_succeeded event
 */
async function handleInvoicePaymentSucceeded(invoice) {
  try {
    if (!invoice.subscription) {
      console.log(`Invoice ${invoice.id} is not for a subscription`);
      return;
    }

    console.log(`Payment succeeded for subscription: ${invoice.subscription}`);

    // Find the subscription in our database
    const subscription = await models.subscriptions2.findOne({
      subscriptionId: invoice.subscription,
    });

    if (!subscription) {
      console.log(`Subscription ${invoice.subscription} not found in database`);
      return;
    }

    // Process referral commission if applicable
    await processReferralCommission(subscription, subscription.createdBy);

    console.log(`Processed payment for subscription: ${invoice.subscription}`);
  } catch (error) {
    console.error(
      `Error handling invoice payment succeeded event: ${error.message}`
    );
    // await sendErrorToAdmin({
    //   error,
    //   subject: "Stripe Invoice Payment Succeeded Handler Error",
    //   context: {
    //     invoiceId: invoice.id,
    //     subscriptionId: invoice.subscription,
    //     customerId: invoice.customer,
    //   },
    // });
  }
}

/**
 * Handle invoice.payment_failed event
 */
async function handleInvoicePaymentFailed(invoice) {
  try {
    if (!invoice.subscription) {
      console.log(`Invoice ${invoice.id} is not for a subscription`);
      return;
    }

    console.log(`Payment failed for subscription: ${invoice.subscription}`);

    // Find the subscription in our database
    const subscription = await models.subscriptions2.findOne({
      subscriptionId: invoice.subscription,
    });

    if (!subscription) {
      console.log(`Subscription ${invoice.subscription} not found in database`);
      return;
    }

    // Mark subscription as past_due
    await models.subscriptions2.findByIdAndUpdate(subscription._id, {
      status: "past_due",
    });

    // Update user record
    await update({
      col: "users",
      data: { _id: subscription.createdBy },
      update: {
        subscription: {
          id: invoice.subscription,
          customerId: subscription.customerId,
          planId: subscription.planId,
          status: "past_due",
          currentPeriodEnd: subscription.currentPeriodEnd,
          updatedAt: new Date(),
        },
      },
      revalidate: "/pricing",
    });

    console.log(
      `Updated subscription status to past_due: ${invoice.subscription}`
    );

    // Send notification to admin about failed payment
    // await sendErrorToAdmin({
    //   error: new Error(
    //     `Payment failed for subscription ${invoice.subscription}`
    //   ),
    //   subject: "Stripe Payment Failed Alert",
    //   context: {
    //     invoiceId: invoice.id,
    //     subscriptionId: invoice.subscription,
    //     customerId: invoice.customer,
    //     userId: subscription.createdBy,
    //     planId: subscription.planId,
    //     amount: invoice.amount_due / 100,
    //   },
    // });
  } catch (error) {
    console.error(
      `Error handling invoice payment failed event: ${error.message}`
    );
    // await sendErrorToAdmin({
    //   error,
    //   subject: "Stripe Invoice Payment Failed Handler Error",
    //   context: {
    //     invoiceId: invoice.id,
    //     subscriptionId: invoice.subscription,
    //     customerId: invoice.customer,
    //   },
    // });
  }
}

/**
 * Helper function to cancel a previous subscription
 */
async function cancelPreviousSubscription(
  subscriptionId,
  newPlanId,
  extraLinksCount,
  explicitReason
) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Find the old subscription
    const oldSubscription = await models.subscriptions2.findById(
      subscriptionId
    );

    if (!oldSubscription) {
      console.error(`Could not find subscription: ${subscriptionId}`);
      return;
    }

    // Cancel in Stripe if it exists
    if (
      oldSubscription.subscriptionId &&
      oldSubscription.subscriptionId !== "pending"
    ) {
      try {
        await stripe.subscriptions.cancel(oldSubscription.subscriptionId);
        console.log(
          `Canceled Stripe subscription: ${oldSubscription.subscriptionId}`
        );
      } catch (stripeCancelError) {
        console.error(
          `Error canceling Stripe subscription: ${stripeCancelError.message}`
        );
        // await sendErrorToAdmin({
        //   error: stripeCancelError,
        //   subject: "Stripe Subscription Cancellation Error",
        //   context: {
        //     subscriptionId: oldSubscription.subscriptionId,
        //     userId: oldSubscription.createdBy,
        //     planId: oldSubscription.planId,
        //   },
        // });
        // Continue even if Stripe cancellation fails
      }
    }

    // Determine reason if not explicitly provided
    let reason = explicitReason || "plan_change";
    if (!explicitReason) {
      if (oldSubscription.planId && newPlanId) {
        if (
          oldSubscription.planId.includes("agency") &&
          newPlanId.includes("creator")
        ) {
          reason = "plan_downgrade";
        } else if (
          oldSubscription.planId.includes("creator") &&
          newPlanId.includes("agency")
        ) {
          reason = "plan_upgrade";
        } else if (oldSubscription.planId === newPlanId) {
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
    await models.subscriptions2.findByIdAndUpdate(subscriptionId, {
      status: "canceled",
      canceledAt: new Date(),
      cancelReason: reason,
      newPlanId: newPlanId,
    });

    console.log(
      `Updated subscription to canceled status with reason: ${reason}`
    );
  } catch (error) {
    console.error(`Error canceling subscription: ${error.message}`);
    // await sendErrorToAdmin({
    //   error,
    //   subject: "Error Canceling Previous Subscription",
    //   context: {
    //     subscriptionId: subscriptionId,
    //     newPlanId: newPlanId,
    //     extraLinksCount: extraLinksCount,
    //     explicitReason: explicitReason,
    //   },
    // });
  }
}

/**
 * Helper function to update or create a subscription record
 */
async function updateSubscriptionRecord(
  sessionId,
  subscription,
  customer,
  createdBy,
  planId,
  subscriptionId,
  extraLinksCount,
  isPlanChange,
  previousPlanId,
  metadata
) {
  try {
    // First, try to find by session ID
    let updatedSubscription = await models.subscriptions2.findOneAndUpdate(
      { stripeSessionId: sessionId },
      {
        status: subscription.status,
        subscriptionId: subscription.id,
        customerId: customer.id,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        trialStart: subscription.trial_start
          ? new Date(subscription.trial_start * 1000)
          : null,
        trialEnd: subscription.trial_end
          ? new Date(subscription.trial_end * 1000)
          : null,
        amount: subscription.items.data[0].price.unit_amount / 100,
        currency: subscription.currency,
        trialDurationDays: metadata.trialDays
          ? parseInt(metadata.trialDays)
          : 0,
        trialActivated: subscription.status === "trialing",
        extraLinks: extraLinksCount > 0 ? extraLinksCount : undefined,
      },
      { new: true }
    );

    if (!updatedSubscription) {
      console.log("Failed to find subscription record for session:", sessionId);

      // Try to find by subscriptionId as fallback
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
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            trialStart: subscription.trial_start
              ? new Date(subscription.trial_start * 1000)
              : null,
            trialEnd: subscription.trial_end
              ? new Date(subscription.trial_end * 1000)
              : null,
            amount: subscription.items.data[0].price.unit_amount / 100,
            currency: subscription.currency,
            trialDurationDays: metadata.trialDays
              ? parseInt(metadata.trialDays)
              : 0,
            trialActivated: subscription.status === "trialing",
            extraLinks: extraLinksCount > 0 ? extraLinksCount : undefined,
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
          // await sendErrorToAdmin({
          //   error: new Error(
          //     `Failed to find subscription record by ID: ${subscriptionId}`
          //   ),
          //   subject: "Subscription Record Update Failure",
          //   context: {
          //     sessionId,
          //     subscriptionId,
          //     createdBy,
          //     planId,
          //   },
          // });
          return;
        }
      } else {
        console.error("No subscription ID to use as fallback");
        // await sendErrorToAdmin({
        //   error: new Error("No subscription ID to use as fallback"),
        //   subject: "Subscription Record Update Failure",
        //   context: {
        //     sessionId,
        //     createdBy,
        //     planId,
        //   },
        // });
        return;
      }
    } else {
      console.log("Updated subscription record:", updatedSubscription._id);
    }

    // Update user record with subscription information
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
        "subscriptionHistory.trialUsed": true,
        "subscriptionHistory.currentPlanStartedAt": new Date(),
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
    await processReferralCommission(updatedSubscription, createdBy);

    return updatedSubscription;
  } catch (error) {
    console.error("Error updating subscription record:", error.message);
    // await sendErrorToAdmin({
    //   error,
    //   subject: "Error Updating Subscription Record",
    //   context: {
    //     sessionId,
    //     subscriptionId: subscription.id,
    //     customerId: customer.id,
    //     createdBy,
    //     planId,
    //   },
    // });
    throw error;
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
    // await sendErrorToAdmin({
    //   error,
    //   subject: "Error Processing Referral Commission",
    //   context: {
    //     subscriptionId: subscription._id,
    //     userId,
    //     amount: subscription.amount,
    //   },
    // });
  }
}
// ? code end webhook handler
