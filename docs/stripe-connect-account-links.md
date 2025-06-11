# Stripe Connect with Account Links API

This document explains the Stripe Connect implementation using Account Links API instead of OAuth.

## Overview

We've implemented Stripe Connect using the Account Links API instead of OAuth because:

- OAuth requires special approval from Stripe ("gated access")
- Account Links API is available to all Stripe accounts
- Provides the same functionality for Express accounts
- Simpler implementation and maintenance

## How It Works

### 1. Account Creation

When a user starts the onboarding process:

1. We create a Stripe Express account using `stripe.accounts.create()`
2. We store the account ID in the user's MongoDB document
3. We create an Account Link for onboarding using `stripe.accountLinks.create()`
4. User is redirected to Stripe's onboarding flow

### 2. Onboarding Flow

1. User completes Stripe's onboarding form
2. Stripe redirects to our return URL with account status
3. We update the user's account status in MongoDB
4. User can now create store items and receive payments

### 3. Account Status Tracking

We track several important fields:

- `onboardingCompleted`: Has submitted all required information
- `chargesEnabled`: Can receive payments
- `payoutsEnabled`: Can receive payouts
- `requirements`: Any outstanding requirements

## API Endpoints

### POST `/api/stripe/connect/create-account`

Creates a new Stripe Express account and returns onboarding URL.

**Response:**

```json
{
  "success": true,
  "accountId": "acct_...",
  "accountLinkUrl": "https://connect.stripe.com/setup/..."
}
```

### POST `/api/stripe/connect/continue-onboarding`

Creates a new Account Link for existing accounts to continue onboarding.

### GET `/api/stripe/connect/return`

Handles return from Stripe onboarding, updates account status.

### GET `/api/stripe/connect/refresh`

Handles refresh requests during onboarding.

### GET `/api/stripe/connect/account-status`

Retrieves current account status from Stripe and updates MongoDB.

## Components

### UserStripeConnectOnboardingButton

Main component for handling Stripe Connect onboarding:

- Shows different states based on account status
- Handles account creation and onboarding continuation
- Provides callback for parent components

**Usage:**

```jsx
<UserStripeConnectOnboardingButton
  mongoUser={mongoUser}
  onOnboardingComplete={(isReady) => setIsStripeConnectReady(isReady)}
  variant="warning"
/>
```

### StripeConnectSettings

Advanced settings component for managing Stripe Connect accounts.

## Helper Functions

Located in `/lib/utils/stripe/stripeConnectHelpers.js`:

- `isStripeConnectReady(mongoUser)`: Check if account is ready for payments
- `hasStripeConnectAccount(mongoUser)`: Check if account exists
- `getStripeConnectStatus(mongoUser)`: Get detailed status information
- `getStripeConnectRequirements(mongoUser)`: Get outstanding requirements
- `calculatePlatformFee(amount, feePercentage)`: Calculate platform fees

## Integration with Store Items

The `AddStoreItemForm` component integrates with Stripe Connect:

1. Shows onboarding button if not set up
2. Disables form fields until onboarding is complete
3. Prevents submission without valid Stripe Connect account

## Environment Variables

Required environment variables:

- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `NEXT_PUBLIC_CLIENT_URL`: Your application's base URL (for redirects)

**Note:** `STRIPE_CLIENT_ID` is no longer required since we're not using OAuth.

## Migration from OAuth

If you previously used OAuth implementation:

1. Existing OAuth fields in UserModel are preserved for backward compatibility
2. New accounts will use Account Links API
3. Existing accounts can continue using their current setup
4. OAuth-specific routes have been removed

## Platform Fees

The system supports 20% platform fees:

1. During checkout, fees are calculated and applied
2. Store owners receive 80% of the sale amount
3. Platform retains 20% as commission
4. Automatic payouts to store owners' bank accounts

## Error Handling

Common errors and solutions:

- "User not authenticated": Ensure user is logged in
- "User already has a Stripe Connect account": Use continue-onboarding endpoint
- "Account not found": Account may have been deleted, create new one
- "Onboarding incomplete": User needs to complete Stripe's onboarding form

## Testing

To test the implementation:

1. Create a test user account
2. Navigate to `/add/storeitems`
3. Click "Set up Stripe Connect"
4. Complete the onboarding flow
5. Verify account status is updated correctly

## Security Considerations

- Account IDs are stored in MongoDB with proper indexing
- Sensitive OAuth fields are marked as legacy and not used
- All API endpoints require user authentication
- Account ownership is verified before operations
- Stripe webhooks are not used (as per requirements)
