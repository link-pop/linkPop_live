# Extra Links Functionality

## Overview

The extra links functionality allows Agency plan subscribers to purchase additional links beyond the base 50 links included in the standard Agency plan. Each extra link costs $1 per month, providing flexibility for customers who need more than the base package but don't want to pay for a predefined higher tier.

## How It Works

### Pricing Structure

- **Base Agency Plan**: $39.99/month with 50 links included
- **Extra Links**: $1 per additional link per month
- **Price Tiers**: For bulk pricing, there are predefined tiers at 100, 150, 200, 250, 300, 350, 400, 450, and 500 links

### User Experience

1. Agency plan subscribers can view their current links (base + extra) on the Pricing page
2. They can adjust their extra links count using a selector interface
3. When increasing/decreasing links:
   - The system calculates the prorated cost based on remaining days in the billing cycle
   - The existing subscription is canceled at period end
   - A new subscription is created with the updated number of links
   - The unused value from the previous subscription is applied as credit to the new one

### Implementation Details

#### Database Schema

The `Subscriptions2Model.js` includes an `extraLinks` field:

```javascript
extraLinks: {
  type: Number,
  required: false,
  default: 0,
}
```

#### Price Calculation

The pricing is handled in `getPlanPrices.js`, which calculates the total price based on the base plan price plus the cost of extra links:

```javascript
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
```

#### Checkout Process

When a user changes their extra links count, the system:

1. Creates a new pending subscription record in `route.js` with the updated extraLinks value
2. Calculates proration based on the remaining days in the current subscription period
3. Processes the payment through Stripe, applying any prorated credit from the previous subscription
4. On successful payment, updates the subscription record and user metadata

#### Handling Subscription Changes

For extra links changes, we use special cancelation reasons:

- `extra_links_increase`: When adding more links
- `extra_links_decrease`: When reducing the number of links

The subscription API handles these changes by:

1. Canceling the previous subscription at period end
2. Creating a new subscription with the updated links count
3. Applying prorated credit from the previous subscription to the new one

#### Admin Dashboard Tracking

The Admin Subscriptions dashboard tracks:

- Active extra links usage
- Average extra links per agency subscription
- Count of link increases and decreases
- Revenue impact from extra links

## API Reference

### Key Endpoints

- **POST /api/stripe/pricing2**:
  Handles subscription creation including extra links parameter

  Example payload:

  ```json
  {
    "planId": "price_agency_monthly",
    "extraLinks": 10,
    "metadata": {
      "isExtraLinksUpgrade": "false"
    }
  }
  ```

- **GET /api/stripe/pricing2/success**:
  Processes successful payments and updates subscription records with extra links information

### Key Functions

- **getPriceByPlanId(planId, extraLinks)**: Returns plan details including price with extra links
- **getSubscriptionData(mongoUser, existingActiveSubscription, newPlanId, trialDays, isChangingPlan, newExtraLinks)**: Prepares subscription data with extra links information for Stripe
- **cancelSubscription2AtPeriodEnd(subscriptionId, options)**: Cancels a subscription with options for extraLinks changes

## Edge Cases and Limitations

- Minimum 0 extra links (can't go below the base 50 links included in Agency plan)
- Maximum 450 extra links (500 total) based on current pricing tiers
- Proration only applies for changes within the same billing cycle
- No refunds for decreasing links - only credit toward future billing
