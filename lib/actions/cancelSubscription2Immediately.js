"use server";

import { update, getOne } from "@/lib/actions/crud";
import { revalidatePath } from "next/cache";
import Stripe from "stripe";
import mongoose from "mongoose";
import { connectToDb } from "@/lib/db/connectToDb";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";

/**
 * Cancels a subscription immediately (not at the end of the period)
 * This is specifically for canceling trial subscriptions or for immediate plan changes
 *
 * @param {string} subscriptionId - The MongoDB ID of the subscription to cancel
 * @param {Object} options - Optional parameters
 * @param {string} options.newPlanId - The ID of the new plan the user is switching to (for upgrades/downgrades)
 * @param {boolean} options.isUpgrade - Whether this is an upgrade (true) or downgrade (false)
 * @param {string} options.cancelReason - Custom reason for cancellation (overrides automatic detection)
 * @param {number} options.extraLinks - The number of extra links for the new plan
 * @returns {Promise<{success: boolean, error: string|null}>} - Result of the operation
 */
export async function cancelSubscription2Immediately(
  subscriptionId,
  options = {}
) {
  try {
    console.log(
      `Starting immediate cancellation for subscription ID: ${subscriptionId}`
    );
    console.log("Options:", options);

    // Get the subscription first
    const subscription = await getOne({
      col: "subscriptions2",
      data: { _id: subscriptionId },
    });

    if (!subscription) {
      console.log("Subscription not found");
      return { success: false, error: "Subscription not found" };
    }

    // Log subscription details for debugging
    console.log("Found subscription:", JSON.stringify(subscription, null, 2));

    // Get current user for subscription history tracking
    const { mongoUser } = await getMongoUser();

    // Get the Stripe subscription ID
    const stripeSubscriptionId = subscription.subscriptionId;

    if (!stripeSubscriptionId) {
      console.log("No Stripe subscription ID found");
      return { success: false, error: "No Stripe subscription ID found" };
    }

    console.log(
      `Starting to cancel subscription ${subscriptionId}, Stripe ID: ${stripeSubscriptionId}`
    );

    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    try {
      // Use Stripe API to cancel immediately
      console.log(
        `Calling Stripe API to cancel subscription ${stripeSubscriptionId} immediately`
      );

      const stripeSubscription = await stripe.subscriptions.cancel(
        stripeSubscriptionId
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

      // Update the local subscription record status to canceled
      console.log(`Updating local subscription record in MongoDB`);
      const updateResult = await update({
        col: "subscriptions2",
        data: { _id: subscriptionId },
        update: {
          $set: {
            status: "canceled",
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

      // Record subscription history in user record
      if (mongoUser) {
        console.log(
          `Recording subscription history for user: ${mongoUser._id}`
        );

        try {
          await update({
            col: "users",
            data: { _id: mongoUser._id },
            update: {
              $set: {
                "subscriptionHistory.trialUsed": true,
                "subscriptionHistory.lastCancellationDate": new Date(),
              },
              $inc: {
                "subscriptionHistory.cancellationCount": 1,
              },
              $push: {
                "subscriptionHistory.priorSubscriptions": {
                  planId: subscription.planId,
                  extraLinks: subscription.extraLinks,
                  startedAt:
                    subscription.currentPeriodStart || subscription.createdAt,
                  endedAt: new Date(),
                  status:
                    subscription.status === "trialing"
                      ? "trial_canceled"
                      : cancelReason === "plan_upgrade"
                      ? "upgraded"
                      : cancelReason === "plan_downgrade"
                      ? "downgraded"
                      : "canceled",
                },
              },
            },
            revalidate: "/pricing",
          });
          console.log(`User subscription history updated`);
        } catch (userUpdateError) {
          console.error(
            "Error updating user subscription history:",
            userUpdateError
          );
          // Continue anyway, this is not critical
        }
      }

      // Direct database update as fallback
      try {
        console.log("Using direct MongoDB update as fallback");
        await connectToDb();
        const result = await mongoose.connection.db
          .collection("subscriptions2")
          .updateOne(
            { _id: new mongoose.Types.ObjectId(subscriptionId) },
            {
              $set: {
                status: "canceled",
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

        // Additional direct update to user record
        if (mongoUser) {
          const userResult = await mongoose.connection.db
            .collection("users")
            .updateOne(
              { _id: new mongoose.Types.ObjectId(mongoUser._id) },
              {
                $set: {
                  "subscriptionHistory.trialUsed": true,
                  "subscriptionHistory.lastCancellationDate": new Date(),
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
