# Stripe Subscription Webhook Migration Guide

This guide explains how to migrate from the current callback-based subscription system to the new webhook-based approach.

## Why Migrate to Webhooks?

Stripe strongly recommends using webhooks for subscription management because:

1. **Reliability**: Webhooks ensure you never miss important events, even if a customer closes their browser during checkout
2. **Real-time updates**: Get notified about subscription changes, payment failures, etc. as they happen
3. **Better error handling**: Process all subscription events asynchronously, reducing frontend complexity
4. **Less code to maintain**: Let Stripe handle complex subscription logic for you

## Migration Steps

### 1. Set Up the Stripe Webhook

Follow the instructions in `docs/stripe-webhook-setup.md` to set up your Stripe webhook endpoint.

### 2. Environment Variables

Ensure your `.env` file includes the required webhook secret:

```
STRIPE_SECRET_KEY=sk_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_signing_secret
```

### 3. Testing Transition Period

During the transition period, both systems will work in parallel:

- The new webhook system will handle events from Stripe
- The old callback system will still function as a fallback

This ensures no disruption to user subscription flows during the migration.

### 4. Monitoring

After deploying the webhook system:

1. Monitor server logs for webhook events
2. Check that subscriptions are being correctly created and updated
3. Verify that referral commissions are being processed

### 5. Complete Migration

Once you've confirmed the webhook system is working correctly:

1. Remove the old success route handler logic
2. Update frontend components to only expect webhook-based responses

## Webhook Events Handled

The new webhook implementation handles these Stripe events:

- `checkout.session.completed`: When a customer completes checkout
- `customer.subscription.created`: When a new subscription is created
- `customer.subscription.updated`: When a subscription is updated (e.g., plan change)
- `customer.subscription.deleted`: When a subscription is canceled
- `invoice.payment_succeeded`: When a subscription payment is successful
- `invoice.payment_failed`: When a subscription payment fails

## Troubleshooting

### Webhook Not Receiving Events

1. Check that your webhook URL is publicly accessible
2. Verify the correct webhook secret is set in your environment variables
3. Check Stripe dashboard for webhook delivery attempts and failures

### Database Updates Not Working

1. Ensure MongoDB connection is working properly
2. Check that webhook handler has correct permissions to update collections
3. Verify subscription IDs are being correctly passed in webhook events

### Need Help?

If you encounter any issues during migration, please contact the development team for assistance.
