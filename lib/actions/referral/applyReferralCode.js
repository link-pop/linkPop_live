"use server";

import { models } from "@/lib/db/models/models";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import { update, add } from "@/lib/actions/crud";

/**
 * Applies a referral code to the current user and creates a referral record
 *
 * @param {string} referralCode - The referral code to apply
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function applyReferralCode(referralCode) {
  try {
    const { mongoUser } = await getMongoUser();

    if (!mongoUser) {
      return {
        success: false,
        message: "User not authenticated",
      };
    }

    // Check if user already has a referral
    if (mongoUser.referredBy) {
      return {
        success: false,
        message: "You've already been referred by someone",
      };
    }

    // Prevent users from using their own referral code
    if (mongoUser.referralCode === referralCode) {
      return {
        success: false,
        message: "You cannot use your own referral code",
      };
    }

    // Find the referrer user by referral code
    const referrer = await models.users.findOne({ referralCode });

    if (!referrer) {
      return {
        success: false,
        message: "Invalid referral code",
      };
    }

    // Ensure we're not creating referrals to self
    if (referrer._id.toString() === mongoUser._id.toString()) {
      return {
        success: false,
        message: "You cannot use your own referral code",
      };
    }

    // Check if there's already a referral record
    const existingReferral = await models.referrals.findOne({
      referrerId: referrer._id,
      referredId: mongoUser._id,
    });

    if (existingReferral) {
      return {
        success: false,
        message: "This referral has already been recorded",
      };
    }

    // Create referral record
    await add({
      col: "referrals",
      data: {
        referrerId: referrer._id,
        referredId: mongoUser._id,
        referralCode,
        status: "pending",
      },
    });

    // Update user with referral information
    await update({
      col: "users",
      data: { _id: mongoUser._id },
      update: {
        referredBy: referrer._id,
        referralCodeUsed: referralCode,
      },
      revalidate: "/profile",
    });

    // Update referrer's stats
    await update({
      col: "users",
      data: { _id: referrer._id },
      update: {
        $inc: { "referralStats.totalReferrals": 1 },
      },
    });

    return {
      success: true,
      message: "Referral code applied successfully",
    };
  } catch (error) {
    console.error("Error applying referral code:", error);
    return {
      success: false,
      message: `Error applying referral code: ${error.message}`,
    };
  }
}
