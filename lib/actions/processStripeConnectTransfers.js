"use server";

import Stripe from "stripe";
import { update } from "./crud";
import { isStripeConnectReadyIncludingDevBypass } from "@/lib/utils/stripe/stripeConnectHelpers";
import { updateStoreEarningsOnOrderChange } from "./storeEarningsActions";

/**
 * Process Stripe Connect transfers for orders
 * Transfers money to store owners while keeping platform fee
 */
export const processStripeConnectTransfers = async ({
  orders,
  stripeSessionId,
}) => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Get the payment intent from the session
    const session = await stripe.checkout.sessions.retrieve(stripeSessionId, {
      expand: ["payment_intent"],
    });

    if (!session.payment_intent) {
      throw new Error("No payment intent found for session");
    }

    const paymentIntentId = session.payment_intent.id;
    const PLATFORM_FEE_PERCENTAGE = 0.2;

    console.log(
      `Processing transfers for ${orders.length} orders from payment intent: ${paymentIntentId}`
    );

    const transferResults = [];

    for (const order of orders) {
      try {
        // Calculate amounts
        const orderTotalCents = Math.round(order.total * 100); // Convert to cents
        const platformFeeCents = Math.round(
          orderTotalCents * PLATFORM_FEE_PERCENTAGE
        );
        const transferAmountCents = orderTotalCents - platformFeeCents;

        // Check if store owner is a dev (bypass Stripe Connect requirements)
        if (order.storeOwner?.isDev) {
          console.log(
            `Dev user detected for order ${order.orderNumber} - simulating successful transfer`
          );

          // For dev users, simulate a successful transfer without actual Stripe operation
          await update({
            col: "storeitemsorders",
            data: { _id: order._id },
            update: {
              stripeTransferId: `dev_transfer_${order._id}`,
              platformFee: platformFeeCents / 100,
              transferAmount: transferAmountCents / 100,
              transferStatus: "completed",
              transferredAt: new Date(),
              devMode: true, // Mark as dev mode transfer
            },
          });

          // Update store earnings for this order
          try {
            await updateStoreEarningsOnOrderChange(order._id);
          } catch (earningsError) {
            console.error("Error updating store earnings:", earningsError);
            // Don't fail the transfer if earnings update fails
          }

          transferResults.push({
            orderId: order._id,
            success: true,
            transferId: `dev_transfer_${order._id}`,
            transferAmount: transferAmountCents / 100,
            platformFee: platformFeeCents / 100,
            devMode: true,
          });

          continue;
        }

        // Get store owner's Stripe Connect account
        const storeOwnerAccountId = order.storeOwner?.stripeConnect?.accountId;

        if (!storeOwnerAccountId) {
          console.error(
            `No Stripe Connect account for store owner ${order.storeOwner?._id}`
          );
          transferResults.push({
            orderId: order._id,
            success: false,
            error: "No Stripe Connect account",
          });
          continue;
        }

        // Verify the Connect account is active
        const account = await stripe.accounts.retrieve(storeOwnerAccountId);

        if (!account.charges_enabled) {
          console.error(
            `Stripe Connect account not enabled for charges: ${storeOwnerAccountId}`
          );
          transferResults.push({
            orderId: order._id,
            success: false,
            error: "Stripe Connect account not enabled",
          });
          continue;
        }

        // Create transfer to store owner
        const transfer = await stripe.transfers.create({
          amount: transferAmountCents,
          currency: "usd",
          destination: storeOwnerAccountId,
          source_transaction: paymentIntentId,
          description: `Order ${order.orderNumber} - Platform fee: $${(
            platformFeeCents / 100
          ).toFixed(2)}`,
          metadata: {
            orderId: order._id.toString(),
            orderNumber: order.orderNumber,
            storeOwnerId: order.storeOwner._id.toString(),
            platformFeeCents: platformFeeCents.toString(),
            transferAmountCents: transferAmountCents.toString(),
          },
        });

        console.log(
          `✅ Transfer created: ${transfer.id} for order ${order.orderNumber}`
        );

        // Update order with transfer information
        await update({
          col: "storeitemsorders",
          data: { _id: order._id },
          update: {
            stripeTransferId: transfer.id,
            platformFee: platformFeeCents / 100, // Store in dollars
            transferAmount: transferAmountCents / 100, // Store in dollars
            transferStatus: "completed",
            transferredAt: new Date(),
          },
        });

        // Update store earnings for this order
        try {
          await updateStoreEarningsOnOrderChange(order._id);
        } catch (earningsError) {
          console.error("Error updating store earnings:", earningsError);
          // Don't fail the transfer if earnings update fails
        }

        transferResults.push({
          orderId: order._id,
          success: true,
          transferId: transfer.id,
          transferAmount: transferAmountCents / 100,
          platformFee: platformFeeCents / 100,
        });
      } catch (transferError) {
        console.error(
          `Error creating transfer for order ${order._id}:`,
          transferError
        );

        transferResults.push({
          orderId: order._id,
          success: false,
          error: transferError.message,
        });

        // Update order with transfer error
        try {
          await update({
            col: "storeitemsorders",
            data: { _id: order._id },
            update: {
              transferStatus: "failed",
              transferError: transferError.message,
            },
          });
        } catch (updateError) {
          console.error(
            `Error updating order with transfer error:`,
            updateError
          );
        }
      }
    }

    const successfulTransfers = transferResults.filter((r) => r.success);
    const failedTransfers = transferResults.filter((r) => !r.success);

    console.log(
      `Transfer processing complete: ${successfulTransfers.length} successful, ${failedTransfers.length} failed`
    );

    return {
      success: true,
      results: transferResults,
      successfulTransfers: successfulTransfers.length,
      failedTransfers: failedTransfers.length,
    };
  } catch (error) {
    console.error("Error processing Stripe Connect transfers:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
