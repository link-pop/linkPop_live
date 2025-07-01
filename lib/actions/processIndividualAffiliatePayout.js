"use server";

import Stripe from "stripe";
import { update } from "./crud";
import { models } from "@/lib/db/models/models";
import { isStripeConnectReadyIncludingDevBypass } from "@/lib/utils/stripe/stripeConnectHelpers";

/**
 * Check if platform has sufficient balance for transfer
 * @param {Object} stripe - Stripe instance
 * @param {number} amountCents - Amount in cents to transfer
 * @returns {Object} - Balance check result
 */
const checkPlatformBalance = async (stripe, amountCents) => {
  try {
    const balance = await stripe.balance.retrieve();
    const availableBalance = balance.available.find(
      (item) => item.currency === "usd"
    );

    if (!availableBalance || availableBalance.amount < amountCents) {
      return {
        sufficient: false,
        availableAmount: availableBalance ? availableBalance.amount : 0,
        requiredAmount: amountCents,
        isTestMode: balance.livemode === false,
      };
    }

    return {
      sufficient: true,
      availableAmount: availableBalance.amount,
      requiredAmount: amountCents,
      isTestMode: balance.livemode === false,
    };
  } catch (error) {
    console.error("❌ Error checking platform balance:", error);
    return {
      sufficient: false,
      error: error.message,
    };
  }
};

/**
 * Process an individual affiliate payout immediately when a commission is earned
 * This replaces the batch processing system with immediate individual payouts
 * @param {Object} earningData - The earning record data
 * @returns {Object} - Processing result
 */
export const processIndividualAffiliatePayout = async (earningData) => {
  try {
    console.log(
      `🚀 Processing individual affiliate payout for earning: ${earningData._id}`
    );

    // Use atomic operation to claim the earning for processing
    // This prevents race conditions by ensuring only one process can claim the earning
    const claimedEarning = await models.referralearnings.findOneAndUpdate(
      {
        _id: earningData._id,
        status: { $in: ["pending", "failed"] }, // Only process pending or failed earnings
      },
      {
        status: "processing", // Immediately set to processing to prevent duplicates
        processedAt: new Date(),
      },
      {
        new: true, // Return the updated document
        runValidators: true,
      }
    );

    // If no earning was claimed, it means another process is handling it or it's already processed
    if (!claimedEarning) {
      console.log(
        `⚠️ Earning ${earningData._id} is already being processed or has been processed`
      );
      return {
        success: false,
        error: "Earning is already being processed or has been completed",
        alreadyProcessed: true,
      };
    }

    console.log(
      `🔒 Successfully claimed earning ${earningData._id} for processing`
    );

    // Get referrer user data
    const referrer = await models.users.findById(claimedEarning.referrerId);
    if (!referrer) {
      console.error(`❌ Referrer not found: ${claimedEarning.referrerId}`);

      // Rollback the status since we can't process without referrer
      await update({
        col: "referralearnings",
        data: { _id: claimedEarning._id },
        update: {
          status: "failed",
          transferError: "Referrer not found",
        },
      });

      return {
        success: false,
        error: "Referrer not found",
      };
    }

    // Check if referrer has Stripe Connect set up (or is dev)
    if (!isStripeConnectReadyIncludingDevBypass(referrer)) {
      console.log(
        `⚠️ Referrer ${claimedEarning.referrerId} doesn't have Stripe Connect set up - reverting to pending`
      );

      // Rollback to pending since this isn't a permanent failure
      await update({
        col: "referralearnings",
        data: { _id: claimedEarning._id },
        update: {
          status: "pending",
          processedAt: null,
        },
      });

      return {
        success: false,
        error: "Stripe Connect not set up",
        needsOnboarding: true,
        // Don't mark as failed - keep pending for when they set up Stripe Connect
      };
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Handle dev mode bypass
    if (referrer.isDev) {
      console.log(
        `👨‍💻 Dev user detected for referrer ${claimedEarning.referrerId} - simulating transfer`
      );

      const devTransferId = `dev_affiliate_${
        claimedEarning.referrerId
      }_${Date.now()}`;

      // Update earning record as paid
      await update({
        col: "referralearnings",
        data: { _id: claimedEarning._id },
        update: {
          status: "paid",
          stripeTransferId: devTransferId,
          transferStatus: "completed",
          transferredAt: new Date(),
          devMode: true,
          paidAt: new Date(),
        },
      });

      // Update referrer stats - decrease pending earnings since it's now paid
      await update({
        col: "users",
        data: { _id: claimedEarning.referrerId },
        update: {
          $inc: {
            "referralStats.pendingEarnings": -claimedEarning.commissionAmount,
            "referralStats.paidEarnings": claimedEarning.commissionAmount,
          },
        },
      });

      console.log(
        `✅ Dev mode payout completed for ${claimedEarning.referrerId}: $${claimedEarning.commissionAmount}`
      );

      return {
        success: true,
        transferId: devTransferId,
        amount: claimedEarning.commissionAmount,
        devMode: true,
      };
    }

    // Get referrer's Stripe Connect account
    const stripeAccountId = referrer.stripeConnect?.accountId;
    if (!stripeAccountId) {
      console.error(
        `❌ No Stripe Connect account for referrer: ${claimedEarning.referrerId}`
      );

      // Rollback to pending since this might be fixed later
      await update({
        col: "referralearnings",
        data: { _id: claimedEarning._id },
        update: {
          status: "pending",
          processedAt: null,
        },
      });

      return {
        success: false,
        error: "No Stripe Connect account",
        needsOnboarding: true,
      };
    }

    // Verify Stripe Connect account is active
    try {
      const account = await stripe.accounts.retrieve(stripeAccountId);
      if (!account.charges_enabled) {
        console.error(
          `❌ Stripe Connect account not enabled: ${stripeAccountId}`
        );

        // Rollback to pending since this might be fixed later
        await update({
          col: "referralearnings",
          data: { _id: claimedEarning._id },
          update: {
            status: "pending",
            processedAt: null,
          },
        });

        return {
          success: false,
          error: "Stripe Connect account not enabled for charges",
          needsOnboarding: true,
        };
      }
    } catch (stripeError) {
      console.error(
        `❌ Error retrieving Stripe account ${stripeAccountId}:`,
        stripeError
      );

      // Rollback to failed since this is likely a permanent issue
      await update({
        col: "referralearnings",
        data: { _id: claimedEarning._id },
        update: {
          status: "failed",
          transferError: "Error validating Stripe Connect account",
        },
      });

      return {
        success: false,
        error: "Error validating Stripe Connect account",
      };
    }

    // Convert amount to cents for Stripe
    const amountCents = Math.round(claimedEarning.commissionAmount * 100);

    // Check platform balance before attempting transfer
    const balanceCheck = await checkPlatformBalance(stripe, amountCents);
    if (!balanceCheck.sufficient) {
      console.error(
        `❌ Insufficient platform balance for transfer. Required: $${(
          amountCents / 100
        ).toFixed(2)}, Available: $${(
          (balanceCheck.availableAmount || 0) / 100
        ).toFixed(2)}`
      );

      let errorMessage = "Insufficient platform balance for transfer";
      if (balanceCheck.isTestMode) {
        errorMessage = `Test mode: Insufficient balance. Please add funds using test card 4000000000000077 to platform account. Required: $${(
          amountCents / 100
        ).toFixed(2)}`;
      }

      // Send admin notification about insufficient balance
      try {
        const { sendErrorToAdmin } = await import(
          "@/lib/actions/sendErrorToAdmin"
        );
        await sendErrorToAdmin({
          error: new Error(
            `Insufficient platform balance for affiliate payout: $${claimedEarning.commissionAmount}`
          ),
          subject: "Urgent: Insufficient Platform Balance for Affiliate Payout",
          context: {
            earningId: claimedEarning._id,
            referrerId: claimedEarning.referrerId,
            commissionAmount: claimedEarning.commissionAmount,
            requiredAmount: amountCents / 100,
            availableAmount: (balanceCheck.availableAmount || 0) / 100,
            isTestMode: balanceCheck.isTestMode,
            stripeAccountId,
          },
        });
      } catch (emailError) {
        console.error(
          "❌ Failed to send admin notification about insufficient balance:",
          emailError
        );
      }

      // Mark as failed with specific error
      await update({
        col: "referralearnings",
        data: { _id: claimedEarning._id },
        update: {
          status: "failed",
          transferStatus: "failed",
          transferError: errorMessage,
        },
      });

      return {
        success: false,
        error: errorMessage,
        balanceIssue: true,
        isTestMode: balanceCheck.isTestMode,
      };
    }

    // Create Stripe transfer for affiliate payout
    try {
      const transfer = await stripe.transfers.create({
        amount: amountCents,
        currency: "usd",
        destination: stripeAccountId,
        description: `Affiliate commission: $${claimedEarning.commissionAmount}`,
        metadata: {
          type: "affiliate_payout",
          referrerId: claimedEarning.referrerId.toString(),
          earningId: claimedEarning._id.toString(),
          subscriptionId: claimedEarning.subscriptionId?.toString(),
          automatic: "true", // Automatic payout (can also be manual via button)
        },
      });

      console.log(
        `✅ Stripe transfer created: ${transfer.id} for $${claimedEarning.commissionAmount}`
      );

      // Update earning record as paid
      await update({
        col: "referralearnings",
        data: { _id: claimedEarning._id },
        update: {
          status: "paid",
          stripeTransferId: transfer.id,
          transferStatus: "completed",
          transferredAt: new Date(),
          paidAt: new Date(),
        },
      });

      // Update referrer stats - decrease pending earnings since it's now paid
      await update({
        col: "users",
        data: { _id: claimedEarning.referrerId },
        update: {
          $inc: {
            "referralStats.pendingEarnings": -claimedEarning.commissionAmount,
            "referralStats.paidEarnings": claimedEarning.commissionAmount,
          },
        },
      });

      console.log(
        `✅ Individual affiliate payout completed for ${claimedEarning.referrerId}: $${claimedEarning.commissionAmount}`
      );

      return {
        success: true,
        transferId: transfer.id,
        amount: claimedEarning.commissionAmount,
      };
    } catch (stripeError) {
      console.error(
        `❌ Stripe transfer failed for earning ${claimedEarning._id}:`,
        stripeError
      );

      let userFriendlyError = stripeError.message;

      // Handle specific Stripe error types with better messaging
      if (stripeError.code === "balance_insufficient") {
        const balanceInfo = await checkPlatformBalance(stripe, amountCents);
        if (balanceInfo.isTestMode) {
          userFriendlyError = `Test mode: Insufficient platform balance. Please add funds using test card 4000000000000077. Required: $${(
            amountCents / 100
          ).toFixed(2)}`;
        } else {
          userFriendlyError =
            "Platform account has insufficient balance for this transfer. Please contact support.";
        }

        // Send admin notification about insufficient balance during transfer
        try {
          const { sendErrorToAdmin } = await import(
            "@/lib/actions/sendErrorToAdmin"
          );
          await sendErrorToAdmin({
            error: new Error(
              `Stripe transfer failed - insufficient platform balance: $${claimedEarning.commissionAmount}`
            ),
            subject:
              "Critical: Stripe Transfer Failed - Insufficient Platform Balance",
            context: {
              earningId: claimedEarning._id,
              referrerId: claimedEarning.referrerId,
              commissionAmount: claimedEarning.commissionAmount,
              requiredAmount: amountCents / 100,
              availableAmount: (balanceInfo.availableAmount || 0) / 100,
              isTestMode: balanceInfo.isTestMode,
              stripeAccountId,
              stripeError: stripeError.message,
              stripeCode: stripeError.code,
            },
          });
        } catch (emailError) {
          console.error(
            "❌ Failed to send admin notification about Stripe balance error:",
            emailError
          );
        }
      } else if (stripeError.code === "account_invalid") {
        userFriendlyError =
          "Recipient Stripe account is invalid or not properly set up";
      } else if (stripeError.code === "routing_number_invalid") {
        userFriendlyError = "Recipient bank account details are invalid";
      }

      // Update earning record as failed
      await update({
        col: "referralearnings",
        data: { _id: claimedEarning._id },
        update: {
          status: "failed",
          transferStatus: "failed",
          transferError: userFriendlyError,
        },
      });

      return {
        success: false,
        error: userFriendlyError,
        stripeError: true,
        stripeCode: stripeError.code,
      };
    }
  } catch (error) {
    console.error(`❌ Error processing individual affiliate payout:`, error);

    // Try to update earning record as failed if we have the ID
    if (earningData._id) {
      try {
        await update({
          col: "referralearnings",
          data: { _id: earningData._id },
          update: {
            status: "failed",
            transferError: error.message,
          },
        });
      } catch (updateError) {
        console.error(
          `❌ Failed to update earning record after error:`,
          updateError
        );
      }
    }

    return {
      success: false,
      error: error.message,
    };
  }
};
