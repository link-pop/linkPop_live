*************************************
LOCAL TEST:

stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
*************************************

# Stripe Webhook Setup Guide

This guide explains how to set up the Stripe webhook for handling subscription events.

## 1. Create a Webhook in Stripe Dashboard

1. Go to the [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers > Webhooks**
3. Click **Add endpoint**
4. Enter your webhook URL:
   - For production: `https://yourdomain.com/api/stripe/webhook`
   - For development using a tunnel like ngrok: `https://your-ngrok-url.ngrok.io/api/stripe/webhook`
5. Select the following events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
6. Click **Add endpoint**
7. After creating the webhook, you'll see the signing secret. Copy this value.

## 2. Add the Webhook Secret to Your Environment Variables

Add the following to your `.env` file:

```
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_signing_secret
```

Make sure this is also set in your production environment.

## 3. Local Testing with the Stripe CLI

For local development, the easiest way to test webhooks is using the Stripe CLI:

1. Install the [Stripe CLI](https://stripe.com/docs/stripe-cli)
2. Login with your Stripe account:
   ```
   stripe login
   ```
3. Forward events to your local server:
   ```
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
4. The CLI will display a webhook signing secret. Note this secret as our code will use it to verify webhooks in development mode.
5. To trigger test events manually, use:
   ```
   stripe trigger checkout.session.completed
   ```

> **Note**: The webhook handler has been configured to use both your environment's STRIPE_WEBHOOK_SECRET and the CLI's webhook secret in development mode. No changes are needed to switch between them.

## 4. Testing in Production

1. In the Stripe Dashboard, go to your webhook endpoint
2. Click **Send test webhook**
3. Select an event type (e.g., `checkout.session.completed`)
4. Click **Send test webhook**
5. Check your server logs to ensure the webhook was received and processed correctly

## 5. Debugging Tips

- Stripe provides a detailed log of all webhook attempts in the dashboard
- Use `console.log` statements in your webhook handler to debug issues
- For complex issues, use the `stripe webhook-logs tailed` command to see detailed logs

## 6. Important Notes

- The webhook endpoint must be publicly accessible in production
- The endpoint must respond with a 200 status code within 10 seconds to acknowledge receipt
- Stripe will retry failed webhook deliveries for up to 3 days
- For security, always verify the webhook signature
