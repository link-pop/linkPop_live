# Pay-Per-View for Chat Messages

This document explains how the pay-per-view feature works for chat messages in the application.

## Overview

The pay-per-view feature allows users to set a price for chat messages with attachments. When a user sends a paid message, the recipient must purchase access to view the attachments. This feature works similarly to the existing pay-per-view feature for feed posts.

## Implementation Details

### Database Schema

- The `ChatMessageModel` has a `price` field that can be set when creating a message.
- Attachments associated with paid messages have the `isPaid` flag set to `true`.
- The `AttachmentModel` uses the `relatedPostId` field to store the message ID for chat message attachments.

### User Flow

1. **Sending a Paid Message**:
   - When composing a message, the user can set a price using the price button in the message composer.
   - The price applies to all attachments in the message.
   - The message text is always visible, but attachments are hidden until purchased.

2. **Viewing a Paid Message**:
   - Recipients see the message text but attachments are hidden behind a payment overlay.
   - The overlay displays the price and a button to purchase access.
   - After successful payment, the attachments become visible.

3. **Payment Processing**:
   - Payments are processed through Stripe.
   - After successful payment, a purchase record is created in the database.
   - The purchase record links the user, the message, and the payment session.

### API Endpoints

- `/api/stripe/chatmessages`: Creates a Stripe checkout session for purchasing access to a message.
- `/api/stripe/chatmessages/success`: Handles successful payment callbacks and updates the purchase record.

### Components

- `ChatmessagePost`: Displays chat messages and handles the paid content overlay for messages with paid attachments.
- `PaidContentOverlay`: Shows a payment overlay for paid content, with specific messaging for chat messages.
- `StripeButton`: Handles payment initiation for both feed posts and chat messages.

## User Experience

- Users are clearly informed when content requires payment.
- The payment process is seamless and integrated with the chat interface.
- After purchase, the content is immediately available without needing to refresh.

## Security Considerations

- Only the message creator and users who have purchased access can view the paid attachments.
- The payment system verifies that users don't pay multiple times for the same content.
- All payment processing is done securely through Stripe.
