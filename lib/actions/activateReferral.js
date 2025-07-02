"use server";

import { models } from "@/lib/db/models/models";
import { update } from "@/lib/actions/crud";

/**
 * Activates a referral from pending to active status when the referred user makes a valid payment
 * @param {string} referredUserId - The MongoDB ID of the referred user who made the payment
 * @param {number} commissionAmount - The commission amount for earnings stats (optional)
 * @returns {Promise<{success: boolean, activated: boolean, error?: string}>}
 */
export async function activateReferral(referredUserId, commissionAmount = 0) {
  try {
    if (!referredUserId) {
      return {
        success: false,
        activated: false,
        error: "referredUserId is required",
      };
    }

    // Find the user to check if they were referred
    const user = await models.users.findById(referredUserId);
    if (!user || !user.referredBy) {
      return { success: true, activated: false, error: "User has no referrer" };
    }

    // Find the referral record
    const referral = await models.referrals.findOne({
      referrerId: user.referredBy,
      referredId: user._id,
    });

    if (!referral) {
      return {
        success: true,
        activated: false,
        error: "No referral record found",
      };
    }

    // Check if referral is already active
    if (referral.status === "active") {
      return {
        success: true,
        activated: false,
        error: "Referral is already active",
      };
    }

    // Only proceed if status is pending
    if (referral.status !== "pending") {
      return {
        success: true,
        activated: false,
        error: `Referral status is ${referral.status}, not pending`,
      };
    }

    // Update referral status to active
    await update({
      col: "referrals",
      data: { _id: referral._id },
      update: {
        status: "active",
        activatedAt: new Date(),
      },
      skipOwnershipCheck: true, // System operation
    });

    // Update referrer stats for referral activation
    await update({
      col: "users",
      data: { _id: user.referredBy },
      update: {
        $inc: {
          "referralStats.activeReferrals": 1,
        },
      },
      skipOwnershipCheck: true, // System operation
    });

    console.log(
      `✅ Activated referral from pending to active for referral ID: ${referral._id}`
    );

    return {
      success: true,
      activated: true,
      referralId: referral._id.toString(),
      referrerId: user.referredBy.toString(),
    };
  } catch (error) {
    console.error("❌ Error activating referral:", error);
    return {
      success: false,
      activated: false,
      error: error.message || "Unknown error occurred",
    };
  }
}
