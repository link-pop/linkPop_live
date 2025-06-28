import { SUBSCRIPTION_PLANS, AGENCY_BASE_LINKS } from "@/lib/utils/constants";

// Utility function to get plan prices consistently across the application
export function getPlanPrices(extraLinks = 0) {
  // Use the new pricing structure from constants
  const linksPriceTable = SUBSCRIPTION_PLANS.AGENCY.PRICE_TIERS;
  const baseLinks = SUBSCRIPTION_PLANS.AGENCY.BASE_LINKS;

  // Calculate the total links (base + extra)
  const totalLinks = baseLinks + (extraLinks || 0);

  // Get the price based on total links
  let totalAgencyPrice;

  // Find the exact tier if possible
  if (linksPriceTable[totalLinks]) {
    totalAgencyPrice = linksPriceTable[totalLinks];
  } else {
    // Find the closest lower tier
    const tiers = Object.keys(linksPriceTable)
      .map(Number)
      .sort((a, b) => a - b);
    let baseTier = baseLinks; // Default to the lowest tier

    for (const tier of tiers) {
      if (tier <= totalLinks) {
        baseTier = tier;
      } else {
        break;
      }
    }

    // Calculate price: base tier price + additional cost for links above the tier
    const additionalLinks = Math.max(0, totalLinks - baseTier);
    totalAgencyPrice = linksPriceTable[baseTier] + additionalLinks;
  }

  // Return plan details in a consistent format
  return {
    // Free plan
    free: {
      price: SUBSCRIPTION_PLANS.FREE.PRICE,
      formatted: SUBSCRIPTION_PLANS.FREE.FORMATTED,
      name: SUBSCRIPTION_PLANS.FREE.NAME,
      planId: SUBSCRIPTION_PLANS.FREE.PLAN_ID,
    },
    // Creator plan
    creator: {
      price: SUBSCRIPTION_PLANS.CREATOR.PRICE,
      formatted: SUBSCRIPTION_PLANS.CREATOR.FORMATTED,
      name: SUBSCRIPTION_PLANS.CREATOR.NAME,
      planId: SUBSCRIPTION_PLANS.CREATOR.PLAN_ID,
    },
    // Agency plan
    agency: {
      price: totalAgencyPrice,
      formatted: `$${totalAgencyPrice.toFixed(2)}`,
      name: SUBSCRIPTION_PLANS.AGENCY.NAME,
      planId: SUBSCRIPTION_PLANS.AGENCY.PLAN_ID,
      baseLinks: baseLinks,
      extraLinks: extraLinks,
      linksPrice: 1, // Price per additional link above tier
      totalLinks: totalLinks,
      priceTiers: linksPriceTable, // Add price tiers for reference
    },
  };
}

// Get price by plan ID
export function getPriceByPlanId(planId, extraLinks = 0) {
  const plans = getPlanPrices(extraLinks);

  // Find the plan that matches the planId
  for (const key in plans) {
    if (plans[key].planId === planId) {
      return plans[key];
    }
  }

  // If no match is found, return the free plan
  return plans.free;
}
