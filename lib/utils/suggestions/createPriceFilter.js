/**
 * Create MongoDB price filter for creator suggestions
 * @param {boolean} showPaidOnly - If true, only show creators with subscription price > 0; if false, only show creators with subscription price = 0
 * @returns {Object} MongoDB filter object for subscription price
 */
export const createPriceFilter = (showPaidOnly) => {
  if (showPaidOnly) {
    // Show only paid creators (price > 0)
    return { subscriptionPrice: { $gt: 0 } };
  } else {
    // Show only free creators (price = 0 or null/undefined)
    return {
      $or: [
        { subscriptionPrice: { $eq: 0 } },
        { subscriptionPrice: { $exists: false } },
        { subscriptionPrice: null },
      ],
    };
  }
};
