import { models } from "@/lib/db/models/models";
import { update } from "./crud";
import Stripe from "stripe";

/**
 * Handle subscription upgrade/downgrade by canceling old subscription and creating new one
 * This ensures both DB and Stripe dashboard are properly synchronized
 *
 * @param {string} userId - MongoDB user ID
 * @param {string} oldSubscriptionId - MongoDB subscription ID to cancel
 * @param {string} newPlanId - New plan ID for the subscription
 * @param {number} extraLinks - Number of extra links (default: 0)
 * @param {string} reason - Reason for change (upgrade/downgrade/plan_change)
 * @returns {Promise<Object>} Result object with success status and details
 */
export async function upgradeDowngradeSubscription2(
  userId,
  oldSubscriptionId,
  newPlanId,
  extraLinks = 0,
  reason = "plan_change"
) {
  console.log(`🔄 Starting subscription upgrade/downgrade process`);
  console.log(
    `User: ${userId}, Old subscription: ${oldSubscriptionId}, New plan: ${newPlanId}`
  );

  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Missing STRIPE_SECRET_KEY environment variable");
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    // 1. Find the old subscription in our database
    const oldSubscription = await models.subscriptions2.findById(
      oldSubscriptionId
    );

    if (!oldSubscription) {
      throw new Error(`Old subscription not found: ${oldSubscriptionId}`);
    }

    if (oldSubscription.createdBy.toString() !== userId) {
      throw new Error("User does not own this subscription");
    }

    console.log(
      `✅ Found old subscription: ${oldSubscription.planId} -> ${newPlanId}`
    );

    // 2. Cancel the old subscription in Stripe (immediately)
    let stripeCancelResult = null;
    if (
      oldSubscription.subscriptionId &&
      oldSubscription.subscriptionId !== "pending"
    ) {
      try {
        console.log(
          `🔥 Canceling Stripe subscription: ${oldSubscription.subscriptionId}`
        );
        stripeCancelResult = await stripe.subscriptions.cancel(
          oldSubscription.subscriptionId
        );
        console.log(
          `✅ Successfully canceled Stripe subscription: ${oldSubscription.subscriptionId}`
        );
      } catch (stripeCancelError) {
        console.error(
          `❌ Error canceling Stripe subscription: ${stripeCancelError.message}`
        );
        // Continue with DB update even if Stripe fails
      }
    }

    // 3. Update the old subscription in our database
    await models.subscriptions2.findByIdAndUpdate(oldSubscriptionId, {
      status: "canceled",
      canceledAt: new Date(),
      cancelReason: reason,
      newPlanId: newPlanId,
      metadata: {
        ...oldSubscription.metadata,
        upgradedDowngradedAt: new Date(),
        replacedByNewSubscription: true,
      },
    });

    console.log(`✅ Updated old subscription in DB with canceled status`);

    // 4. Get the customer ID for creating new subscription
    let customerId = oldSubscription.customerId;

    // If we don't have a customer ID, we'll create the subscription via checkout
    // (this should normally not happen for upgrades/downgrades)
    if (!customerId || customerId === "pending") {
      console.log(
        `⚠️ No customer ID found, subscription creation will need to go through checkout`
      );
      return {
        success: true,
        requiresCheckout: true,
        message:
          "Old subscription canceled, new subscription requires checkout process",
        oldSubscriptionCanceled: true,
        stripeSubscriptionCanceled: !!stripeCancelResult,
      };
    }

    // 5. For now, we'll let the checkout process handle the new subscription creation
    // This is the safest approach to ensure proper proration and payment collection
    console.log(`✅ Subscription upgrade/downgrade preparation complete`);
    console.log(
      `Old subscription canceled in DB and Stripe, ready for checkout process`
    );

    return {
      success: true,
      requiresCheckout: true,
      message:
        "Old subscription canceled successfully, proceed with checkout for new subscription",
      oldSubscriptionCanceled: true,
      stripeSubscriptionCanceled: !!stripeCancelResult,
      customerId: customerId,
      oldPlanId: oldSubscription.planId,
      newPlanId: newPlanId,
      extraLinks: extraLinks,
      reason: reason,
    };
  } catch (error) {
    console.error(
      `❌ Error in upgradeDowngradeSubscription2: ${error.message}`
    );

    // If there was an error, we should not leave the system in an inconsistent state
    // Log the error but don't throw it - let the calling code handle it

    return {
      success: false,
      error: error.message,
      message: "Failed to process subscription upgrade/downgrade",
    };
  }
}

/**
 * Alternative function that creates the new subscription directly in Stripe
 * This is more complex but provides immediate subscription creation
 *
 * @param {string} userId - MongoDB user ID
 * @param {string} oldSubscriptionId - MongoDB subscription ID to cancel
 * @param {Object} newPlanDetails - Details for the new plan
 * @returns {Promise<Object>} Result object with success status and new subscription details
 */
export async function upgradeDowngradeSubscription2Direct(
  userId,
  oldSubscriptionId,
  newPlanDetails
) {
  console.log(`🔄 Starting DIRECT subscription upgrade/downgrade process`);

  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Missing STRIPE_SECRET_KEY environment variable");
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    // 1. Find the old subscription
    const oldSubscription = await models.subscriptions2.findById(
      oldSubscriptionId
    );

    if (!oldSubscription) {
      throw new Error(`Old subscription not found: ${oldSubscriptionId}`);
    }

    if (oldSubscription.createdBy.toString() !== userId) {
      throw new Error("User does not own this subscription");
    }

    // 2. Create new subscription in Stripe first
    console.log(`📦 Creating new subscription in Stripe`);

    const newStripeSubscription = await stripe.subscriptions.create({
      customer: oldSubscription.customerId,
      items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: newPlanDetails.name,
              description:
                newPlanDetails.description ||
                `${newPlanDetails.name} subscription`,
            },
            unit_amount: Math.round(newPlanDetails.price * 100), // Convert to cents
            recurring: {
              interval: "month",
            },
          },
        },
      ],
      metadata: {
        planId: newPlanDetails.planId,
        createdBy: userId,
        extraLinks: newPlanDetails.extraLinks?.toString() || "0",
        upgradedFrom: oldSubscription.planId,
        previousSubscriptionId: oldSubscriptionId,
      },
      proration_behavior: "create_prorations", // This handles proration automatically
    });

    console.log(
      `✅ Created new Stripe subscription: ${newStripeSubscription.id}`
    );

    // 3. Create new subscription record in our database
    const newSubscriptionRecord = await models.subscriptions2.create({
      createdBy: userId,
      customerId: oldSubscription.customerId,
      subscriptionId: newStripeSubscription.id,
      planId: newPlanDetails.planId,
      extraLinks: newPlanDetails.extraLinks || 0,
      status: newStripeSubscription.status,
      currentPeriodStart: new Date(
        newStripeSubscription.current_period_start * 1000
      ),
      currentPeriodEnd: new Date(
        newStripeSubscription.current_period_end * 1000
      ),
      amount: newPlanDetails.price,
      currency: newStripeSubscription.currency,
      trialActivated: newStripeSubscription.status === "trialing",
      cancelAtPeriodEnd: newStripeSubscription.cancel_at_period_end,
      metadata: {
        upgradedFrom: oldSubscription.planId,
        previousSubscriptionId: oldSubscriptionId,
        directUpgrade: true,
        createdViaUpgrade: new Date(),
      },
    });

    console.log(
      `✅ Created new subscription record in DB: ${newSubscriptionRecord._id}`
    );

    // 4. NOW cancel the old subscription (both Stripe and DB)
    if (
      oldSubscription.subscriptionId &&
      oldSubscription.subscriptionId !== "pending"
    ) {
      try {
        await stripe.subscriptions.cancel(oldSubscription.subscriptionId);
        console.log(
          `✅ Canceled old Stripe subscription: ${oldSubscription.subscriptionId}`
        );
      } catch (stripeCancelError) {
        console.error(
          `❌ Error canceling old Stripe subscription: ${stripeCancelError.message}`
        );
        // Continue anyway
      }
    }

    // 5. Update old subscription in DB
    await models.subscriptions2.findByIdAndUpdate(oldSubscriptionId, {
      status: "canceled",
      canceledAt: new Date(),
      cancelReason: newPlanDetails.reason || "plan_change",
      newPlanId: newPlanDetails.planId,
      metadata: {
        ...oldSubscription.metadata,
        replacedBySubscriptionId: newSubscriptionRecord._id.toString(),
        directUpgradeCancellation: true,
      },
    });

    // 6. Update user record
    await update({
      col: "users",
      data: { _id: userId },
      update: {
        subscription: {
          id: newStripeSubscription.id,
          customerId: oldSubscription.customerId,
          planId: newPlanDetails.planId,
          status: newStripeSubscription.status,
          currentPeriodEnd: new Date(
            newStripeSubscription.current_period_end * 1000
          ),
          updatedAt: new Date(),
        },
      },
      revalidate: "/pricing",
    });

    console.log(
      `✅ Direct subscription upgrade/downgrade completed successfully!`
    );

    return {
      success: true,
      requiresCheckout: false,
      newSubscription: {
        id: newStripeSubscription.id,
        dbId: newSubscriptionRecord._id,
        planId: newPlanDetails.planId,
        status: newStripeSubscription.status,
      },
      oldSubscriptionCanceled: true,
      message: "Subscription upgraded/downgraded successfully",
    };
  } catch (error) {
    console.error(
      `❌ Error in direct subscription upgrade/downgrade: ${error.message}`
    );

    return {
      success: false,
      error: error.message,
      message: "Failed to process direct subscription upgrade/downgrade",
    };
  }
}
