"use server";

import { getAll } from "@/lib/actions/crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import {
  getCurrentDateOrSimulated,
  SIMULATE_FUTURE_DATE,
} from "@/lib/utils/simulateDate";

export async function fetchUserSubscription2() {
  try {
    // Get current user
    const { mongoUser } = await getMongoUser();

    if (!mongoUser) {
      return null;
    }

    // Get the user's active subscription using the user's MongoDB ID
    const subscriptions = await getAll({
      col: "subscriptions2",
      data: {
        createdBy: mongoUser._id.toString(),
        status: { $in: ["active", "trialing"] },
      },
    });

    // Create result object - either the subscription or a base object
    let result = null;

    if (subscriptions && subscriptions.length > 0) {
      result = subscriptions[0];

      // Ensure the MongoDB _id is properly converted to a string for client-side use
      if (result._id) {
        // Store the original MongoDB ObjectId as a string to ensure it can be used client-side
        result.id = result._id.toString();
      }

      // Add trial-specific data
      if (result.status === "trialing" && result.trialEnd) {
        // Get current date or simulated future date if testing
        const now = getCurrentDateOrSimulated(SIMULATE_FUTURE_DATE);

        const trialEnd = new Date(result.trialEnd);

        // Calculate days remaining in trial (can be negative if expired)
        const daysRemaining = Math.ceil(
          (trialEnd - now) / (1000 * 60 * 60 * 24)
        );

        // Store both actual days remaining (can be negative) and non-negative value
        result.trialDaysRemaining = daysRemaining;
        result.trialDaysRemainingDisplay =
          daysRemaining > 0 ? daysRemaining : 0;

        // Add flag for trial status
        result.isTrialEnding = daysRemaining <= 3 && daysRemaining > 0;
        result.isTrialExpired = daysRemaining <= 0;

        // Calculate percentage complete, capped at 100%
        result.trialPercentComplete = result.trialDurationDays
          ? Math.min(
              100,
              Math.round(
                ((result.trialDurationDays - daysRemaining) /
                  result.trialDurationDays) *
                  100
              )
            )
          : 0;
      }
    } else {
      // No active subscription, create a basic result object
      result = null;
    }

    // Add trial history information regardless of current subscription status
    if (mongoUser.subscriptionHistory?.trialUsed) {
      // If we have no result object but need to return trial info, create one
      if (!result) {
        result = {
          // Mark clearly that this is just a trial history object, not an active subscription
          hasActiveSubscription: false,
          isTrialHistoryOnly: true,
        };
      }

      // Add information about previous trial usage
      result.hasUsedTrial = true;
      result.trialEndedAt = mongoUser.subscriptionHistory?.trialEndedAt || null;
    }

    // For debugging only - if we're returning just trial history, mark it clearly for client
    if (result && !result._id && !result.id && !result.subscriptionId) {
      result.isTrialHistoryOnly = true;
      result.hasActiveSubscription = false;
    }

    // Add debugging logs
    console.log("Subscription result:", {
      id: result?.id,
      _id: result?._id,
      planId: result?.planId,
      status: result?.status,
      isTrialHistoryOnly: result?.isTrialHistoryOnly || false,
      hasActiveSubscription: result?.hasActiveSubscription !== false,
    });

    return result;
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return null;
  }
}
