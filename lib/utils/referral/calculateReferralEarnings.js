/**
 * Utility functions for referral earnings calculations
 */

/**
 * Checks if a subscription should be counted for referral earnings
 * @param {Object} subscription - The subscription object
 * @returns {boolean} - Whether the subscription should be counted
 */
export function isValidForReferralEarnings(subscription) {
  if (!subscription) return false;

  // Filter out trial subscriptions
  if (subscription.status === "trialing") return false;

  // Filter out canceled trials
  if (
    (subscription.status === "canceled" || subscription.cancelAtPeriodEnd) &&
    subscription.trialEnd &&
    ((subscription.canceledAt &&
      new Date(subscription.canceledAt) < new Date(subscription.trialEnd)) ||
      subscription.cancelAtPeriodEnd)
  ) {
    return false;
  }

  return true;
}

/**
 * Filters an array of earnings to only include valid ones
 * @param {Array} earnings - Array of earnings objects
 * @returns {Array} - Filtered array with only valid earnings
 */
export function filterValidEarnings(earnings) {
  if (!Array.isArray(earnings)) return [];

  return earnings.filter((earning) => {
    const subscription = earning.subscriptionId;
    return isValidForReferralEarnings(subscription);
  });
}

/**
 * Calculates total earnings statistics from filtered earnings
 * @param {Array} filteredEarnings - Array of filtered valid earnings
 * @returns {Object} - Statistics object with totals
 */
export function calculateEarningsStats(filteredEarnings) {
  const totalEarnings = filteredEarnings.reduce(
    (sum, earning) => sum + (parseFloat(earning.commissionAmount) || 0),
    0
  );

  const pendingEarnings = filteredEarnings
    .filter((earning) => earning.status === "pending")
    .reduce(
      (sum, earning) => sum + (parseFloat(earning.commissionAmount) || 0),
      0
    );

  const paidEarnings = filteredEarnings
    .filter((earning) => earning.status === "paid")
    .reduce(
      (sum, earning) => sum + (parseFloat(earning.commissionAmount) || 0),
      0
    );

  return {
    totalEarnings,
    pendingEarnings,
    paidEarnings,
  };
}

/**
 * Groups earnings by referral relationship
 * @param {Array} filteredEarnings - Array of filtered valid earnings
 * @returns {Object} - Grouped earnings by referrer:referred key
 */
export function groupEarningsByReferral(filteredEarnings) {
  const earningsByReferral = {};

  filteredEarnings.forEach((earning) => {
    const referrerId = earning.referrerId?._id?.toString();
    const referredId = earning.referredId?._id?.toString();

    if (referrerId && referredId) {
      const key = `${referrerId}:${referredId}`;
      if (!earningsByReferral[key]) {
        earningsByReferral[key] = [];
      }
      earningsByReferral[key].push(earning);
    }
  });

  return earningsByReferral;
}

/**
 * Complete process to get filtered earnings and stats
 * @param {Array} earnings - Array of raw earnings records
 * @returns {Object} - Object containing filtered earnings and stats
 */
export function processReferralEarnings(earnings) {
  const validEarnings = filterValidEarnings(earnings);
  const stats = calculateEarningsStats(validEarnings);

  return {
    filteredEarnings: validEarnings,
    stats,
  };
}
