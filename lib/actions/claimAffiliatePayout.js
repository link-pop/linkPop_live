"use server";

import { models } from "@/lib/db/models/models";
import { processIndividualAffiliatePayout } from "./processIndividualAffiliatePayout";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import { isEligibleForAffiliatePayout } from "@/lib/utils/affiliate/affiliatePayoutHelpers";

/**
 * Claim affiliate payout for a specific earning
 * @param {Object} options - Claim options
 * @param {string} options.earningId - The earning ID to claim payout for
 * @returns {Object} - Claim result
 */
export const claimAffiliatePayout = async ({ earningId }) => {
  try {
    // Get authenticated user
    const { mongoUser } = await getMongoUser();
    if (!mongoUser) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    // Validate earning exists and belongs to the user
    const earning = await models.referralearnings.findById(earningId);
    if (!earning) {
      return {
        success: false,
        error: "Earning not found",
      };
    }

    // Check if this earning belongs to the authenticated user
    if (earning.referrerId.toString() !== mongoUser._id.toString()) {
      return {
        success: false,
        error: "You can only claim your own earnings",
      };
    }

    // Check if earning is in pending or failed status (allow retry of failed payouts)
    if (earning.status !== "pending" && earning.status !== "failed") {
      return {
        success: false,
        error:
          earning.status === "processing"
            ? "This earning is currently being processed. Please wait a moment and try again."
            : `Earning is already ${earning.status}`,
        alreadyProcessed: earning.status === "paid",
      };
    }

    // Check if user is eligible for payouts
    const eligibility = isEligibleForAffiliatePayout(mongoUser);
    if (!eligibility.eligible) {
      return {
        success: false,
        error: eligibility.reason,
        needsOnboarding: eligibility.needsOnboarding,
      };
    }

    console.log(
      `🎯 Manual payout claim initiated by user ${mongoUser._id} for earning ${earningId}`
    );

    // Process the individual payout
    const payoutResult = await processIndividualAffiliatePayout({
      _id: earning._id,
      referrerId: earning.referrerId,
      commissionAmount: earning.commissionAmount,
      subscriptionId: earning.subscriptionId,
    });

    if (payoutResult.success) {
      console.log(
        `✅ Manual payout claim successful: ${payoutResult.transferId}`
      );
      return {
        success: true,
        transferId: payoutResult.transferId,
        amount: payoutResult.amount,
        message: `Successfully claimed payout of $${payoutResult.amount}${
          payoutResult.devMode ? " (dev mode)" : ""
        }`,
        devMode: payoutResult.devMode,
      };
    } else {
      console.log(`❌ Manual payout claim failed: ${payoutResult.error}`);
      return {
        success: false,
        error: payoutResult.error,
        needsOnboarding: payoutResult.needsOnboarding,
      };
    }
  } catch (error) {
    console.error("❌ Error processing manual payout claim:", error);
    return {
      success: false,
      error: "An error occurred while processing your payout claim",
    };
  }
};

/**
 * Claim all pending affiliate payouts for the authenticated user
 * @returns {Object} - Batch claim result
 */
export const claimAllAffiliatePayout = async () => {
  try {
    // Get authenticated user
    const { mongoUser } = await getMongoUser();
    if (!mongoUser) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    // Check if user is eligible for payouts
    const eligibility = isEligibleForAffiliatePayout(mongoUser);
    if (!eligibility.eligible) {
      return {
        success: false,
        error: eligibility.reason,
        needsOnboarding: eligibility.needsOnboarding,
      };
    }

    // Get all pending and failed earnings for this user (allow retry of failed payouts)
    const pendingEarnings = await models.referralearnings.find({
      referrerId: mongoUser._id,
      status: { $in: ["pending", "failed"] },
    });

    if (pendingEarnings.length === 0) {
      // Check if there are any processing earnings
      const processingEarnings = await models.referralearnings.find({
        referrerId: mongoUser._id,
        status: "processing",
      });

      if (processingEarnings.length > 0) {
        return {
          success: false,
          error: `${processingEarnings.length} earning(s) are currently being processed. Please wait a moment and try again.`,
        };
      }

      return {
        success: false,
        error: "No pending earnings to claim",
      };
    }

    console.log(
      `🎯 Batch payout claim initiated by user ${mongoUser._id} for ${pendingEarnings.length} earnings`
    );

    const results = [];
    let successCount = 0;
    let totalAmount = 0;

    // Process each earning individually
    for (const earning of pendingEarnings) {
      try {
        const payoutResult = await processIndividualAffiliatePayout({
          _id: earning._id,
          referrerId: earning.referrerId,
          commissionAmount: earning.commissionAmount,
          subscriptionId: earning.subscriptionId,
        });

        if (payoutResult.success) {
          successCount++;
          totalAmount += payoutResult.amount;
          results.push({
            earningId: earning._id,
            success: true,
            amount: payoutResult.amount,
            transferId: payoutResult.transferId,
          });
        } else {
          results.push({
            earningId: earning._id,
            success: false,
            error: payoutResult.error,
          });
        }
      } catch (error) {
        console.error(`❌ Error processing earning ${earning._id}:`, error);
        results.push({
          earningId: earning._id,
          success: false,
          error: "Processing error",
        });
      }
    }

    console.log(
      `✅ Batch payout claim completed: ${successCount}/${pendingEarnings.length} successful`
    );

    return {
      success: successCount > 0,
      processedCount: pendingEarnings.length,
      successCount,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      message:
        successCount > 0
          ? `Successfully claimed ${successCount} payout${
              successCount > 1 ? "s" : ""
            } totaling $${totalAmount.toFixed(2)}`
          : "No payouts could be processed",
      results,
    };
  } catch (error) {
    console.error("❌ Error processing batch payout claim:", error);
    return {
      success: false,
      error: "An error occurred while processing your payout claims",
    };
  }
};
