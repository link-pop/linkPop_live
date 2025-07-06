"use server";

import { getAll, update } from "@/lib/actions/crud";
import { models } from "@/lib/db/models/models";
import { connectToDb } from "@/lib/db/connectToDb";

/**
 * Utility to fix missing referral data in subscriptions
 * This function backfills referrerId and referralCode from user data
 * when they are missing from subscription records
 */
export async function fixSubscriptionReferralData() {
  try {
    await connectToDb();

    console.log("🔧 Starting subscription referral data fix...");

    // Get all subscriptions that don't have referrerId but should
    const subscriptions = await getAll({
      col: "subscriptions2",
      populate: ["createdBy"],
      limit: 10000, // Process in batches if needed
    });

    console.log(`📊 Found ${subscriptions.length} subscriptions to check`);

    let fixedCount = 0;
    let skippedCount = 0;

    for (const subscription of subscriptions) {
      try {
        // Skip if referrerId is already set
        if (subscription.referrerId) {
          skippedCount++;
          continue;
        }

        // Skip if no createdBy user
        if (!subscription.createdBy || !subscription.createdBy.referredBy) {
          skippedCount++;
          continue;
        }

        // Get the user's referral information
        const user = subscription.createdBy;

        if (user.referredBy && user.referralCodeUsed) {
          // Update the subscription with referral data
          await update({
            col: "subscriptions2",
            data: { _id: subscription._id },
            update: {
              referrerId: user.referredBy,
              referralCode: user.referralCodeUsed,
              referralCommissionPercentage: 20, // Default commission
            },
            skipOwnershipCheck: true, // System operation
          });

          fixedCount++;
          console.log(
            `✅ Fixed subscription ${subscription._id} for user ${user._id}`
          );
        } else {
          skippedCount++;
        }
      } catch (error) {
        console.error(
          `❌ Error fixing subscription ${subscription._id}:`,
          error
        );
      }
    }

    console.log(`🎉 Referral data fix completed:`);
    console.log(`   - Fixed: ${fixedCount} subscriptions`);
    console.log(`   - Skipped: ${skippedCount} subscriptions`);

    return {
      success: true,
      fixed: fixedCount,
      skipped: skippedCount,
      total: subscriptions.length,
    };
  } catch (error) {
    console.error("❌ Error in fixSubscriptionReferralData:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get referral data for a user to be used when creating subscriptions
 * @param {string} userId - The user's MongoDB ID
 * @returns {Object} Referral data object or null
 */
export async function getUserReferralDataForSubscription(userId) {
  try {
    await connectToDb();

    const user = await models.users.findById(userId);

    if (!user || !user.referredBy) {
      return null;
    }

    return {
      referrerId: user.referredBy,
      referralCode: user.referralCodeUsed,
      referralCommissionPercentage: 20, // Default commission
    };
  } catch (error) {
    console.error("❌ Error getting user referral data:", error);
    return null;
  }
}
