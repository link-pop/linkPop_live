// ! DID NOT TEST THIS SCRIPT
// RUN: node scripts/cleanup-duplicate-referral-earnings.js

/**
 * Cleanup script for duplicate referral earnings
 * This script identifies and removes duplicate referral earnings that may have been created
 * before implementing proper duplicate prevention in the webhook system.
 *
 * Run this once after deploying the duplicate prevention fix.
 */

import { models } from "../lib/db/models/models.js";
import connectToDb from "../lib/db/connectToDb.js";

async function cleanupDuplicateReferralEarnings() {
  try {
    await connectToDb();
    console.log("🔗 Connected to database");

    // Find duplicate earnings using aggregation
    const duplicateEarnings = await models.referralearnings.aggregate([
      {
        $group: {
          _id: {
            referrerId: "$referrerId",
            referredId: "$referredId",
            subscriptionId: "$subscriptionId",
            periodStart: "$periodStart",
            periodEnd: "$periodEnd",
          },
          documents: { $push: "$$ROOT" },
          count: { $sum: 1 },
        },
      },
      {
        $match: {
          count: { $gt: 1 },
        },
      },
    ]);

    console.log(
      `Found ${duplicateEarnings.length} groups of duplicate earnings`
    );

    if (duplicateEarnings.length === 0) {
      console.log("✅ No duplicate earnings found");
      return;
    }

    let totalRemoved = 0;
    let totalKept = 0;

    for (const group of duplicateEarnings) {
      const earnings = group.documents;
      console.log(`\n📋 Processing group with ${earnings.length} duplicates:`);
      console.log(`  - Referrer: ${group._id.referrerId}`);
      console.log(`  - Referred: ${group._id.referredId}`);
      console.log(`  - Subscription: ${group._id.subscriptionId}`);
      console.log(
        `  - Period: ${group._id.periodStart} to ${group._id.periodEnd}`
      );

      // Sort by status priority: paid > processing > pending > failed
      // Then by creation date (keep the earliest)
      earnings.sort((a, b) => {
        const statusPriority = {
          paid: 4,
          processing: 3,
          pending: 2,
          failed: 1,
        };

        const aPriority = statusPriority[a.status] || 0;
        const bPriority = statusPriority[b.status] || 0;

        if (aPriority !== bPriority) {
          return bPriority - aPriority; // Higher priority first
        }

        // If same status, keep the earliest created
        return new Date(a.createdAt) - new Date(b.createdAt);
      });

      // Keep the first one (highest priority/earliest), remove the rest
      const toKeep = earnings[0];
      const toRemove = earnings.slice(1);

      console.log(
        `  ✅ Keeping: ${toKeep._id} (${toKeep.status}, created: ${toKeep.createdAt})`
      );

      for (const earning of toRemove) {
        console.log(
          `  🗑️  Removing: ${earning._id} (${earning.status}, created: ${earning.createdAt})`
        );

        // Remove the duplicate earning
        await models.referralearnings.deleteOne({ _id: earning._id });
        totalRemoved++;
      }

      totalKept++;
    }

    console.log(`\n📊 Cleanup Summary:`);
    console.log(`  - Groups processed: ${duplicateEarnings.length}`);
    console.log(`  - Earnings kept: ${totalKept}`);
    console.log(`  - Earnings removed: ${totalRemoved}`);
    console.log(`✅ Cleanup completed successfully`);
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
    throw error;
  }
}

// Run the cleanup if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  cleanupDuplicateReferralEarnings()
    .then(() => {
      console.log("🎉 Cleanup script completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Cleanup script failed:", error);
      process.exit(1);
    });
}

export default cleanupDuplicateReferralEarnings;
