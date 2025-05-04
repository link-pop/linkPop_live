"use server";

import { update, getOne } from "@/lib/actions/crud";
import { revalidatePath } from "next/cache";
import Stripe from "stripe";
import mongoose from "mongoose";
import { connectToDb } from "@/lib/db/connectToDb";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";

/**
 * Cancels a subscription at the end of the current billing period
 * Does NOT immediately cancel the subscription
 *
 * @param {string} subscriptionId - The MongoDB ID of the subscription to cancel
 * @param {Object} options - Optional parameters
 * @param {string} options.newPlanId - The ID of the new plan the user is switching to (for upgrades/downgrades)
 * @param {boolean} options.isUpgrade - Whether this is an upgrade (true) or downgrade (false)
 * @param {string} options.cancelReason - Custom reason for cancellation (overrides automatic detection)
 * @returns {Promise<{success: boolean, error: string|null}>} - Result of the operation
 */
export async function cancelSubscription2AtPeriodEnd(
  subscriptionId,
  options = {}
) {
  try {
    console.log(`Starting cancellation for subscription ID: ${subscriptionId}`);
    console.log("Options:", options);

    if (!subscriptionId) {
      console.log("Subscription ID is null or undefined");
      return { success: false, error: "Invalid subscription ID" };
    }

    // Parse ID if it's not in the right format for MongoDB
    let mongoId;
    try {
      // If it's already a valid ObjectId, use it directly
      if (mongoose.Types.ObjectId.isValid(subscriptionId)) {
        mongoId = subscriptionId;
      } else {
        console.log(
          "Warning: Provided ID is not a valid MongoDB ObjectId format",
          subscriptionId
        );
        // For non-MongoDB IDs, we'll attempt to query differently
      }
    } catch (idError) {
      console.error("Error parsing subscription ID:", idError);
      return { success: false, error: "Invalid subscription ID format" };
    }

    // Get the subscription first - try different queries based on ID format
    let subscription;
    try {
      // First try with _id
      subscription = await getOne({
        col: "subscriptions2",
        data: { _id: mongoId },
      });

      // If not found and the ID doesn't look like a MongoDB ObjectId, try other fields
      if (!subscription && !mongoose.Types.ObjectId.isValid(subscriptionId)) {
        console.log(
          "Subscription not found by _id, trying subscriptionId field"
        );
        subscription = await getOne({
          col: "subscriptions2",
          data: { subscriptionId: subscriptionId },
        });
      }
    } catch (queryError) {
      console.error("Error querying subscription:", queryError);
      return {
        success: false,
        error: "Database error when querying subscription",
      };
    }

    if (!subscription) {
      console.log("Subscription not found");
      return { success: false, error: "Subscription not found" };
    }

    // Log subscription details for debugging
    console.log("Found subscription:", JSON.stringify(subscription, null, 2));

    // Get current user for subscription history tracking
    const { mongoUser } = await getMongoUser();
    const isTrial = subscription.status === "trialing";

    // If it's already marked for cancellation, nothing to do
    if (subscription.cancelAtPeriodEnd) {
      console.log("Subscription already marked for cancellation");
      return { success: true };
    }

    // Get the Stripe subscription ID
    const stripeSubscriptionId = subscription.subscriptionId;

    if (!stripeSubscriptionId) {
      console.log("No Stripe subscription ID found");
      return { success: false, error: "No Stripe subscription ID found" };
    }

    console.log(
      `Starting to cancel subscription ${subscription._id}, Stripe ID: ${stripeSubscriptionId}`
    );

    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    try {
      // Use Stripe API to cancel at period end
      console.log(
        `Calling Stripe API to cancel subscription ${stripeSubscriptionId} at period end`
      );
      const stripeSubscription = await stripe.subscriptions.update(
        stripeSubscriptionId,
        {
          cancel_at_period_end: true,
        }
      );

      console.log(`Stripe API response success`);

      // Determine the cancellation reason based on options
      let cancelReason = options.cancelReason || "plan_change";
      if (!options.cancelReason && options.newPlanId) {
        // Check if current plan is agency or creator
        const currentPlanIsAgency = subscription.planId?.includes("agency");
        const newPlanIsAgency = options.newPlanId?.includes("agency");

        // If we have explicit isUpgrade flag, use it
        if (options.isUpgrade !== undefined) {
          cancelReason = options.isUpgrade ? "plan_upgrade" : "plan_downgrade";
        }
        // Otherwise infer from plan IDs
        else if (currentPlanIsAgency && !newPlanIsAgency) {
          cancelReason = "plan_downgrade";
        } else if (!currentPlanIsAgency && newPlanIsAgency) {
          cancelReason = "plan_upgrade";
        }
      }

      console.log(`Setting cancelReason to: ${cancelReason}`);

      // Update the local subscription record using the update function
      console.log(`Updating local subscription record in MongoDB using update`);
      const updateResult = await update({
        col: "subscriptions2",
        data: { _id: subscription._id },
        update: {
          $set: {
            cancelAtPeriodEnd: true,
            canceledAt: new Date(),
            cancelReason: cancelReason,
            ...(options.newPlanId && { newPlanId: options.newPlanId }),
            ...(options.extraLinks !== undefined && {
              extraLinks: options.extraLinks,
            }),
          },
        },
        revalidate: "/pricing",
      });

      console.log(`MongoDB update completed`);

      // Update user record regardless of trial or not - ALWAYS mark trial as used
      if (mongoUser) {
        console.log(`Updating subscription history for user: ${mongoUser._id}`);

        // Base update for any subscription cancellation
        const userUpdate = {
          $set: {
            // ALWAYS mark trial as used for any subscription cancellation
            "subscriptionHistory.trialUsed": true,
            "subscriptionHistory.lastCancellationDate": new Date(),
          },
          $inc: {
            "subscriptionHistory.cancellationCount": 1,
          },
        };

        // Additional fields for trial subscriptions
        if (isTrial) {
          userUpdate.$set["subscriptionHistory.trialEndedAt"] =
            subscription.trialEnd || new Date();
        }

        // Add the subscription to prior subscriptions
        userUpdate.$push = {
          "subscriptionHistory.priorSubscriptions": {
            planId: subscription.planId,
            extraLinks: subscription.extraLinks,
            startedAt:
              subscription.currentPeriodStart || subscription.createdAt,
            endedAt: subscription.currentPeriodEnd,
            status: isTrial
              ? "trial_canceled"
              : cancelReason === "plan_upgrade"
              ? "upgraded"
              : cancelReason === "plan_downgrade"
              ? "downgraded"
              : "canceled",
          },
        };

        try {
          await update({
            col: "users",
            data: { _id: mongoUser._id },
            update: userUpdate,
            revalidate: "/pricing",
          });
          console.log(`User subscription history updated`);
        } catch (userUpdateError) {
          console.error("Error updating user history:", userUpdateError);
          // Continue anyway, this is not critical
        }
      }

      // Direct database update as fallback
      try {
        console.log("Using direct MongoDB update as fallback");
        await connectToDb();
        const objectId = new mongoose.Types.ObjectId(subscription._id);
        const result = await mongoose.connection.db
          .collection("subscriptions2")
          .updateOne(
            { _id: objectId },
            {
              $set: {
                cancelAtPeriodEnd: true,
                canceledAt: new Date(),
                cancelReason: cancelReason,
                ...(options.newPlanId && { newPlanId: options.newPlanId }),
                ...(options.extraLinks !== undefined && {
                  extraLinks: options.extraLinks,
                }),
              },
            }
          );
        console.log("Direct MongoDB update result:", result);

        // Also update user record directly to mark trial as used
        if (mongoUser) {
          const userResult = await mongoose.connection.db
            .collection("users")
            .updateOne(
              { _id: new mongoose.Types.ObjectId(mongoUser._id) },
              {
                $set: {
                  "subscriptionHistory.trialUsed": true,
                },
              }
            );
          console.log("Direct user record update result:", userResult);
        }
      } catch (directDbError) {
        console.error("Error with direct MongoDB update:", directDbError);
        // Continue anyway, don't throw
      }

      // Revalidate relevant paths
      revalidatePath("/pricing");
      revalidatePath("/settings");

      return { success: true };
    } catch (stripeError) {
      console.error("Stripe error canceling subscription:", stripeError);
      return {
        success: false,
        error: stripeError.message || "Stripe error occurred",
      };
    }
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
