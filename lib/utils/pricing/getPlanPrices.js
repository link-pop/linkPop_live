// Utility function to get plan prices consistently across the application
export function getPlanPrices(extraLinks = 0) {
  // Calculate agency price with extra links based on the provided pricing table
  const baseAgencyPrice = 39.99;

  // Define links-price table
  const linksPriceTable = {
    50: 39.99, // Base price with 50 links
    100: 89.99, // Price for 100 links
    150: 139.99, // Price for 150 links
    200: 189.99, // Price for 200 links
    250: 239.99, // Price for 250 links
    300: 289.99, // Price for 300 links
    350: 339.99, // Price for 350 links
    400: 389.99, // Price for 400 links
    450: 439.99, // Price for 450 links
    500: 489.99, // Price for 500 links
  };

  // Calculate the total links (base 50 + extra)
  const totalLinks = 50 + (extraLinks || 0);

  // Get the price based on total links
  // If not in the table (e.g., 75 links), calculate based on the previous tier (50) plus $1 per additional link
  let totalAgencyPrice;

  // Find the exact tier if possible
  if (linksPriceTable[totalLinks]) {
    totalAgencyPrice = linksPriceTable[totalLinks];
  } else {
    // Find the closest lower tier
    const tiers = Object.keys(linksPriceTable)
      .map(Number)
      .sort((a, b) => a - b);
    let baseTier = 50; // Default to the lowest tier

    for (const tier of tiers) {
      if (tier < totalLinks) {
        baseTier = tier;
      } else {
        break;
      }
    }

    // Calculate price: base tier price + $1 per additional link
    totalAgencyPrice = linksPriceTable[baseTier] + (totalLinks - baseTier);
  }

  // Return plan details in a consistent format
  return {
    // Free plan doesn't have a Stripe price ID
    free: {
      price: 0,
      formatted: "$0",
      name: "Starter",
      planId: null,
    },
    // Creator plan
    creator: {
      price: 4.99,
      formatted: "$4.99",
      name: "Creator",
      planId: "price_creator_monthly",
    },
    // Agency plan
    agency: {
      price: totalAgencyPrice,
      formatted: `$${totalAgencyPrice.toFixed(2)}`,
      name: "Agency",
      planId: "price_agency_monthly",
      baseLinks: 50,
      extraLinks: extraLinks,
      linksPrice: 1, // $1 per extra link between tiers
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
