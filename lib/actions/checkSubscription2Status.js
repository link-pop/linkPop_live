"use server";

import { getOne } from "@/lib/actions/crud";
import mongoose from "mongoose";
import {
  getCurrentDateOrSimulated,
  SIMULATE_FUTURE_DATE,
} from "@/lib/utils/simulateDate";

/**
 * Checks if a creator has a valid subscription (active or within trial period)
 * @param {string|Object} userId - MongoDB ID of the user to check
 * @param {boolean} allowFreeSubscription - Whether to allow free subscription (no subscription record)
 * @returns {Promise<boolean>} - Whether the user has a valid subscription
 */
export async function checkSubscription2Status(
  userId,
  allowFreeSubscription = false
) {
  if (!userId) {
    console.log(`Subscription check failed: No userId provided`);
    return false;
  }

  try {
    // Convert ObjectId to string if necessary
    const createdById =
      userId instanceof mongoose.Types.ObjectId
        ? userId.toString()
        : typeof userId === "object" && userId._id
        ? userId._id.toString()
        : userId.toString();

    console.log(`Checking subscription for user ID: ${createdById}`);

    // Get the user's active subscription
    const subscription = await getOne({
      col: "subscriptions2",
      data: {
        createdBy: createdById,
        status: { $in: ["active", "trialing"] },
      },
    });

    // If no subscription and free is allowed, return true
    if (!subscription) {
      console.log(
        `No subscription found for user ${createdById}, allowFree=${allowFreeSubscription}`
      );
      return allowFreeSubscription;
    }

    console.log(
      `Found subscription for user ${createdById}: status=${subscription.status}, id=${subscription._id}`
    );

    // For active subscriptions, always return true
    if (subscription.status === "active") {
      console.log(`User ${createdById} has active subscription`);
      return true;
    }

    // Check if trial is expired
    if (subscription.status === "trialing" && subscription.trialEnd) {
      // Get current date or simulated future date if testing
      const now = getCurrentDateOrSimulated(SIMULATE_FUTURE_DATE);

      const trialEnd = new Date(subscription.trialEnd);

      // Compare dates directly
      const isValid = now <= trialEnd;

      console.log(
        `Trial check for user ${createdById}: now=${now.toISOString()}, trialEnd=${trialEnd.toISOString()}, isValid=${isValid}`
      );

      return isValid;
    }

    // Default to true for active subscription
    return true;
  } catch (error) {
    console.error("Error checking subscription status:", error);
    return false;
  }
}
