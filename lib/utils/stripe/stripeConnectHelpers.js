/**
 * Stripe Connect Helper Functions
 * Utilities for managing Stripe Connect accounts using Account Links API
 */

/**
 * Check if a user has completed Stripe Connect onboarding
 * @param {Object} mongoUser - The user object from MongoDB
 * @returns {boolean} - True if onboarding is complete and charges are enabled
 */
export const isStripeConnectReady = (mongoUser) => {
  return (
    mongoUser?.stripeConnect?.onboardingCompleted &&
    mongoUser?.stripeConnect?.chargesEnabled
  );
};

/**
 * Check if a user has completed Stripe Connect onboarding OR is a dev (bypassing requirements)
 * @param {Object} mongoUser - The user object from MongoDB
 * @returns {boolean} - True if onboarding is complete, charges are enabled, OR user is a dev
 */
export const isStripeConnectReadyIncludingDevBypass = (mongoUser) => {
  // If user is a dev, bypass Stripe Connect requirements
  if (mongoUser?.isDev) {
    return true;
  }

  // Otherwise, check normal Stripe Connect status
  return isStripeConnectReady(mongoUser);
};

/**
 * Check if a user has a Stripe Connect account (but may not be fully onboarded)
 * @param {Object} mongoUser - The user object from MongoDB
 * @returns {boolean} - True if user has a Stripe Connect account ID
 */
export const hasStripeConnectAccount = (mongoUser) => {
  return Boolean(mongoUser?.stripeConnect?.accountId);
};

/**
 * Get the Stripe Connect account status for display
 * @param {Object} mongoUser - The user object from MongoDB
 * @returns {Object} - Status object with display information
 */
export const getStripeConnectStatus = (mongoUser) => {
  // If user is a dev, bypass Stripe Connect requirements
  if (mongoUser?.isDev) {
    return {
      status: "dev_bypass",
      message: "Dev mode - Stripe Connect bypassed",
      canReceivePayments: true,
      needsOnboarding: false,
    };
  }

  const stripeConnect = mongoUser?.stripeConnect;

  if (!stripeConnect?.accountId) {
    return {
      status: "not_setup",
      message: "Stripe Connect not set up",
      canReceivePayments: false,
      needsOnboarding: true,
    };
  }

  if (stripeConnect.onboardingCompleted && stripeConnect.chargesEnabled) {
    return {
      status: "active",
      message: "Stripe Connect active",
      canReceivePayments: true,
      needsOnboarding: false,
    };
  }

  if (stripeConnect.accountId && !stripeConnect.onboardingCompleted) {
    return {
      status: "pending_onboarding",
      message: "Onboarding incomplete",
      canReceivePayments: false,
      needsOnboarding: true,
    };
  }

  if (stripeConnect.onboardingCompleted && !stripeConnect.chargesEnabled) {
    return {
      status: "pending_approval",
      message: "Pending Stripe approval",
      canReceivePayments: false,
      needsOnboarding: false,
    };
  }

  return {
    status: "unknown",
    message: "Unknown status",
    canReceivePayments: false,
    needsOnboarding: true,
  };
};

/**
 * Get requirements that need to be fulfilled for Stripe Connect account
 * @param {Object} mongoUser - The user object from MongoDB
 * @returns {Object} - Requirements object
 */
export const getStripeConnectRequirements = (mongoUser) => {
  const requirements = mongoUser?.stripeConnect?.requirements || {};

  return {
    currentlyDue: requirements.currentlyDue || [],
    eventuallyDue: requirements.eventuallyDue || [],
    pastDue: requirements.pastDue || [],
    pendingVerification: requirements.pendingVerification || [],
    hasRequirements:
      (requirements.currentlyDue?.length || 0) +
        (requirements.pastDue?.length || 0) +
        (requirements.pendingVerification?.length || 0) >
      0,
  };
};

/**
 * Calculate platform fee for a given amount
 * @param {number} amount - The amount in cents
 * @param {number} feePercentage - The fee percentage (default 0.2 for 20%)
 * @returns {Object} - Object with original amount, fee, and net amount
 */
export const calculatePlatformFee = (amount, feePercentage = 0.2) => {
  const fee = Math.round(amount * feePercentage);
  const netAmount = amount - fee;

  return {
    originalAmount: amount,
    platformFee: fee,
    netAmount: netAmount,
    feePercentage: feePercentage,
  };
};

/**
 * Format Stripe Connect account capabilities for display
 * @param {Object} mongoUser - The user object from MongoDB
 * @returns {Object} - Formatted capabilities
 */
export const getStripeConnectCapabilities = (mongoUser) => {
  const capabilities = mongoUser?.stripeConnect?.capabilities || {};

  return {
    cardPayments: capabilities.cardPayments || "inactive",
    transfers: capabilities.transfers || "inactive",
    canAcceptPayments: capabilities.cardPayments === "active",
    canReceiveTransfers: capabilities.transfers === "active",
  };
};
