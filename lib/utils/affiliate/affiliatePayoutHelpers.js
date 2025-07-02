/**
 * Affiliate Payout Helper Functions
 * Utilities for processing affiliate commission payouts via Stripe Connect
 */

import { isStripeConnectReadyIncludingDevBypass } from "@/lib/utils/stripe/stripeConnectHelpers";

// Minimum payout amount removed - payouts are now automatic and immediate
// export const MINIMUM_PAYOUT_AMOUNT = 50; // REMOVED - no longer needed

/**
 * Check if a user is eligible for affiliate payouts
 * @param {Object} mongoUser - The user object from MongoDB
 * @returns {Object} - Eligibility status and details
 */
export const isEligibleForAffiliatePayout = (mongoUser) => {
  if (!mongoUser) {
    return {
      eligible: false,
      reason: "User not found",
    };
  }

  // Check if user has Stripe Connect set up (or is dev)
  if (!isStripeConnectReadyIncludingDevBypass(mongoUser)) {
    return {
      eligible: false,
      reason: "stripeConnectNotSetup",
      needsOnboarding: true,
    };
  }

  return {
    eligible: true,
    reason: "Eligible for payouts",
  };
};

/**
 * Calculate total pending earnings for a user
 * @param {Array} earnings - Array of earnings records
 * @returns {Object} - Payout calculation details
 */
export const calculatePendingPayout = (earnings) => {
  if (!Array.isArray(earnings)) {
    return {
      totalPending: 0,
      eligibleForPayout: true, // Always eligible since payouts are automatic
      earningsCount: 0,
    };
  }

  const pendingEarnings = earnings.filter(
    (earning) =>
      earning.status === "pending" ||
      earning.status === "failed" ||
      earning.status === "processing"
  );

  const totalPending = pendingEarnings.reduce(
    (sum, earning) => sum + (parseFloat(earning.commissionAmount) || 0),
    0
  );

  return {
    totalPending: parseFloat(totalPending.toFixed(2)),
    eligibleForPayout: true, // Always eligible since payouts are automatic
    earningsCount: pendingEarnings.length,
    pendingEarnings,
  };
};

/**
 * Group earnings by referrer for batch processing
 * @param {Array} earnings - Array of all pending earnings
 * @returns {Object} - Grouped earnings by referrer ID
 */
export const groupEarningsByReferrer = (earnings) => {
  const grouped = {};

  earnings.forEach((earning) => {
    const referrerId =
      earning.referrerId?._id?.toString() || earning.referrerId?.toString();

    if (!referrerId) return;

    if (!grouped[referrerId]) {
      grouped[referrerId] = {
        referrer: earning.referrerId,
        earnings: [],
        totalAmount: 0,
      };
    }

    grouped[referrerId].earnings.push(earning);
    grouped[referrerId].totalAmount +=
      parseFloat(earning.commissionAmount) || 0;
  });

  // Round total amounts to 2 decimal places
  Object.keys(grouped).forEach((referrerId) => {
    grouped[referrerId].totalAmount = parseFloat(
      grouped[referrerId].totalAmount.toFixed(2)
    );
  });

  return grouped;
};

/**
 * Filter grouped earnings to only include those eligible for payout
 * @param {Object} groupedEarnings - Earnings grouped by referrer
 * @returns {Object} - All earnings are eligible since payouts are automatic
 */
export const filterEligiblePayouts = (groupedEarnings) => {
  // Return all earnings since there's no minimum threshold anymore
  return groupedEarnings;
};

/**
 * Generate a unique batch ID for payout processing
 * @returns {string} - Unique batch ID
 */
export const generatePayoutBatchId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `batch_${timestamp}_${random}`;
};

/**
 * Calculate platform fee for affiliate transfers (if any)
 * Note: For affiliate payouts, we typically don't take additional fees
 * since the commission is already calculated from the original subscription
 * @param {number} amount - The amount in dollars
 * @returns {Object} - Fee calculation (no fee for affiliate payouts)
 */
export const calculateAffiliateTransferAmount = (amount) => {
  // Convert to cents for Stripe
  const amountCents = Math.round(amount * 100);

  return {
    originalAmount: amount,
    transferAmountCents: amountCents,
    transferAmount: amount,
    platformFee: 0, // No additional fee for affiliate payouts
  };
};

/**
 * Validate payout request
 * @param {Object} payout - Payout object with referrer and earnings
 * @returns {Object} - Validation result
 */
export const validatePayoutRequest = (payout) => {
  if (!payout.referrer) {
    return {
      valid: false,
      error: "Missing referrer information",
    };
  }

  if (!Array.isArray(payout.earnings) || payout.earnings.length === 0) {
    return {
      valid: false,
      error: "No earnings to process",
    };
  }

  // No minimum threshold check anymore - all amounts are valid
  return {
    valid: true,
  };
};
