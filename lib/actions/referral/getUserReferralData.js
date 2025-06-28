"use server";

import { getAll } from "@/lib/actions/crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";

/**
 * Gets all referral-related data for the current user
 *
 * @returns {Promise<{
 *   success: boolean,
 *   referralCode: string|null,
 *   referralUrl: string|null,
 *   referrals: Array,
 *   earnings: Array,
 *   stats: Object,
 *   isReferred: boolean,
 *   referredBy: Object|null,
 *   message: string
 * }>}
 */
export async function getUserReferralData() {
  try {
    const { mongoUser } = await getMongoUser();

    if (!mongoUser) {
      return {
        success: false,
        referralCode: null,
        referralUrl: null,
        referrals: [],
        earnings: [],
        stats: null,
        isReferred: false,
        referredBy: null,
        message: "User not authenticated",
      };
    }

    // Get base URL for constructing referral link
    const baseUrl =
      process.env.NEXT_PUBLIC_CLIENT_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    // Calculate referral URL if user has a code
    const referralUrl = mongoUser.referralCode
      ? `${baseUrl}/?ref=${mongoUser.referralCode}`
      : null;

    // Get referrals (people the user has referred)
    const referrals = await getAll({
      col: "referrals",
      data: { referrerId: mongoUser._id.toString() },
      populate: ["referredId"],
    });

    // Get earnings from referrals
    const earnings = await getAll({
      col: "referralearnings",
      data: { referrerId: mongoUser._id.toString() },
      populate: ["referredId", "subscriptionId"],
    });

    // Get who referred this user (if applicable)
    let referredBy = null;
    if (mongoUser.referredBy) {
      const referrerUser = await getAll({
        col: "users",
        data: { _id: mongoUser.referredBy.toString() },
      });

      if (referrerUser && referrerUser.length > 0) {
        referredBy = referrerUser[0];
      }
    }

    return {
      success: true,
      referralCode: mongoUser.referralCode || null,
      referralUrl,
      referrals: referrals || [],
      earnings: earnings || [],
      stats: mongoUser.referralStats || {
        totalReferrals: 0,
        activeReferrals: 0,
        totalEarnings: 0,
        pendingEarnings: 0,
        paidEarnings: 0,
      },
      isReferred: !!mongoUser.referredBy,
      referredBy,
      message: "Referral data retrieved successfully",
    };
  } catch (error) {
    console.error("Error getting referral data:", error);
    return {
      success: false,
      referralCode: null,
      referralUrl: null,
      referrals: [],
      earnings: [],
      stats: null,
      isReferred: false,
      referredBy: null,
      message: `Error getting referral data: ${error.message}`,
    };
  }
}
