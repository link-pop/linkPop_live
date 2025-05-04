"use server";

import { getOne } from "@/lib/actions/crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";

/**
 * Checks if a user is eligible for a free trial
 *
 * Prevents users from repeatedly using free trials by checking their subscription history
 *
 * @returns {Promise<{eligible: boolean, reason: string|null}>} Whether the user is eligible for a trial and why not if applicable
 */
export async function checkTrialEligibility() {
  try {
    // Get current user
    const { mongoUser } = await getMongoUser();

    if (!mongoUser) {
      return {
        eligible: false,
        reason: "authentication_required",
        message: "You must be logged in to check trial eligibility",
      };
    }

    // 1. Check if user has an active subscription or trial
    const activeSubscription = await getOne({
      col: "subscriptions2",
      data: {
        createdBy: mongoUser._id,
        status: { $in: ["active", "trialing"] },
      },
    });

    if (activeSubscription) {
      return {
        eligible: false,
        reason: "active_subscription",
        message: "You already have an active subscription or trial",
      };
    }

    // 2. Check if user has previously used a trial
    if (mongoUser.subscriptionHistory?.trialUsed) {
      // If the user has ever used a trial, they cannot get another one
      return {
        eligible: false,
        reason: "previous_trial",
        message: "You have already used your free trial",
      };
    }

    // 3. User has never used a trial before
    return { eligible: true, reason: null };
  } catch (error) {
    console.error("Error checking trial eligibility:", error);
    // On error, default to eligible to prevent blocking legitimate users
    return { eligible: true, reason: null };
  }
}
