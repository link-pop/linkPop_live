/**
 * Utility functions for subscription data handling and validation
 */

/**
 * Validates and enriches subscription data for admin display
 * @param {Array} subscriptions - Array of subscription objects
 * @returns {Array} Validated and enriched subscription data
 */
export function validateAndEnrichSubscriptionData(subscriptions) {
  if (!Array.isArray(subscriptions)) {
    console.error("❌ Invalid subscriptions data: expected array");
    return [];
  }

  return subscriptions.map((sub) => {
    // Ensure required fields exist
    const enrichedSub = {
      ...sub,
      // Ensure referrerId is properly formatted
      referrerId: sub.referrerId || null,
      // Ensure referralCode exists
      referralCode: sub.referralCode || null,
      // Ensure commission percentage is set
      referralCommissionPercentage: sub.referralCommissionPercentage || 20,
      // Ensure amount is a number
      amount: typeof sub.amount === "number" ? sub.amount : 0,
      // Ensure currency is set
      currency: sub.currency || "usd",
      // Ensure extraLinks is a number
      extraLinks: typeof sub.extraLinks === "number" ? sub.extraLinks : 0,
    };

    // Validate referrer data consistency
    if (enrichedSub.referrerId && !enrichedSub.referralCode) {
      console.warn(
        `⚠️ Subscription ${sub._id} has referrerId but no referralCode`
      );
    }

    return enrichedSub;
  });
}

/**
 * Gets safe referrer information from subscription
 * @param {Object} subscription - Subscription object
 * @returns {Object} Safe referrer info
 */
export function getSafeReferrerInfo(subscription) {
  if (!subscription || !subscription.referrerId) {
    return {
      hasReferrer: false,
      referrerId: null,
      referrerName: null,
      referrerAvatar: null,
      referralCode: null,
    };
  }

  // Handle different referrerId formats (populated vs ObjectId)
  let referrerId = null;
  let referrerName = "Unknown";
  let referrerAvatar = null;

  if (
    typeof subscription.referrerId === "object" &&
    subscription.referrerId._id
  ) {
    // Populated referrer
    referrerId = subscription.referrerId._id.toString();
    referrerName =
      subscription.referrerId.name ||
      subscription.referrerId.displayName ||
      subscription.referrerId.username ||
      "Unknown";
    referrerAvatar =
      subscription.referrerId.avatar ||
      subscription.referrerId.profilePicture ||
      subscription.referrerId.image;
  } else if (typeof subscription.referrerId === "string") {
    // ObjectId string
    referrerId = subscription.referrerId;
  }

  return {
    hasReferrer: true,
    referrerId,
    referrerName,
    referrerAvatar,
    referralCode: subscription.referralCode || null,
  };
}

/**
 * Calculates commission amount safely
 * @param {Object} subscription - Subscription object
 * @param {Array} allSubscriptions - All subscriptions for context
 * @returns {number} Commission amount
 */
export function calculateCommissionAmount(subscription, allSubscriptions) {
  if (!subscription || !subscription.referrerId) {
    return 0;
  }

  const amount =
    typeof subscription.amount === "number" ? subscription.amount : 0;
  const commissionPercentage = subscription.referralCommissionPercentage || 20;

  // Import and use the payment amount calculation
  try {
    const {
      getPaymentAmount,
    } = require("@/lib/utils/subscription/paymentUtils");
    const paidAmount = getPaymentAmount(subscription, allSubscriptions);

    if (paidAmount <= 0) {
      return 0;
    }

    return (paidAmount * commissionPercentage) / 100;
  } catch (error) {
    console.error("❌ Error calculating commission:", error);
    // Fallback calculation
    return amount > 0 ? (amount * commissionPercentage) / 100 : 0;
  }
}

/**
 * Groups subscriptions by referrer for statistics
 * @param {Array} subscriptions - Array of subscription objects
 * @returns {Object} Grouped referrer statistics
 */
export function groupSubscriptionsByReferrer(subscriptions) {
  const referrerStats = {};
  const validatedSubs = validateAndEnrichSubscriptionData(subscriptions);

  validatedSubs.forEach((sub) => {
    const referrerInfo = getSafeReferrerInfo(sub);

    if (!referrerInfo.hasReferrer) {
      return;
    }

    const referrerId = referrerInfo.referrerId;

    if (!referrerStats[referrerId]) {
      referrerStats[referrerId] = {
        id: referrerId,
        name: referrerInfo.referrerName,
        avatar: referrerInfo.referrerAvatar,
        subscriptions: [],
        totalCommissions: 0,
        totalReferrals: 0,
      };
    }

    referrerStats[referrerId].subscriptions.push(sub);
    referrerStats[referrerId].totalReferrals += 1;

    // Calculate commission for this subscription
    const commission = calculateCommissionAmount(sub, subscriptions);
    referrerStats[referrerId].totalCommissions += commission;
  });

  return referrerStats;
}

/**
 * Validates subscription data integrity
 * @param {Array} subscriptions - Array of subscription objects
 * @returns {Object} Validation results
 */
export function validateSubscriptionDataIntegrity(subscriptions) {
  const results = {
    total: subscriptions.length,
    valid: 0,
    issues: [],
    missingReferralData: 0,
    invalidAmounts: 0,
    missingCreatedBy: 0,
  };

  subscriptions.forEach((sub, index) => {
    let isValid = true;

    // Check for missing createdBy
    if (!sub.createdBy) {
      results.missingCreatedBy++;
      results.issues.push({
        index,
        id: sub._id,
        issue: "Missing createdBy field",
      });
      isValid = false;
    }

    // Check for referral data consistency
    if (sub.referrerId && !sub.referralCode) {
      results.missingReferralData++;
      results.issues.push({
        index,
        id: sub._id,
        issue: "Has referrerId but missing referralCode",
      });
      isValid = false;
    }

    // Check for invalid amounts
    if (typeof sub.amount !== "number" || sub.amount < 0) {
      results.invalidAmounts++;
      results.issues.push({
        index,
        id: sub._id,
        issue: `Invalid amount: ${sub.amount}`,
      });
      isValid = false;
    }

    if (isValid) {
      results.valid++;
    }
  });

  return results;
}
