"use server";

import Stripe from "stripe";
import { getOne, update } from "./crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import { revalidatePath } from "next/cache";
import { sendOrderCancelledNotificationToStoreOwner } from "./emailNotifications";

export const cancelStoreItemOrder = async ({ orderId }) => {
  try {
    const { mongoUser } = await getMongoUser();
    if (!mongoUser?._id) {
      return { error: "User not authenticated" };
    }

    // Get the order with populated data
    const order = await getOne({
      col: "storeitemsorders",
      data: { _id: orderId },
      populate: ["storeOwner", "createdBy"],
    });

    if (!order) {
      return { error: "Order not found" };
    }

    // Check if user is the buyer (order creator)
    if (order.createdBy._id.toString() !== mongoUser._id.toString()) {
      return { error: "You can only cancel your own orders" };
    }

    // Check if order is already cancelled or refunded
    if (
      order.orderStatus === "cancelled" ||
      order.paymentStatus === "refunded"
    ) {
      return { error: "Order is already cancelled or refunded" };
    }

    // Check if order is not paid yet
    if (order.paymentStatus !== "paid") {
      return { error: "Only paid orders can be cancelled with refund" };
    }

    // Check if order has been shipped
    if (order.orderStatus === "shipped" || order.orderStatus === "delivered") {
      return {
        error: "Cannot cancel orders that have been shipped or delivered",
      };
    }

    // Calculate time since order was created
    const orderDate = new Date(order.createdAt);
    const currentDate = new Date();
    const timeDifference = currentDate.getTime() - orderDate.getTime();
    const daysDifference = timeDifference / (1000 * 3600 * 24);

    // Check if 1 week (7 days) has passed - allow cancellation only after 1 week
    // For dev users, bypass this restriction
    const isDevUser =
      mongoUser.isDev ||
      mongoUser.email?.includes("@dev.") ||
      mongoUser.email?.includes("@test.");

    if (!isDevUser && daysDifference < 7) {
      const remainingDays = Math.ceil(7 - daysDifference);
      return {
        error: `Order can only be cancelled after 1 week from order date. ${remainingDays} day(s) remaining.`,
      };
    }

    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    let refundResult = null;

    // Process refund if not in dev mode
    if (!order.devMode && order.stripePaymentIntentId) {
      try {
        // Create refund in Stripe
        refundResult = await stripe.refunds.create({
          payment_intent: order.stripePaymentIntentId,
          amount: Math.round(order.total * 100), // Convert to cents
          reason: "requested_by_customer",
          metadata: {
            orderId: order._id.toString(),
            orderNumber: order.orderNumber,
            userId: mongoUser._id.toString(),
            cancelledAt: new Date().toISOString(),
          },
        });

        console.log(
          `✅ Stripe refund created: ${refundResult.id} for order ${order.orderNumber}`
        );
      } catch (stripeError) {
        console.error("❌ Stripe refund error:", stripeError);
        return {
          error: `Failed to process refund: ${stripeError.message}`,
        };
      }
    } else if (order.devMode) {
      console.log(`Dev mode order ${order.orderNumber} - simulating refund`);
      refundResult = {
        id: `dev_refund_${order._id}`,
        amount: Math.round(order.total * 100),
        status: "succeeded",
      };
    } else {
      console.log(
        `No payment intent found for order ${order.orderNumber} - updating status only`
      );
    }

    // Update order status in database
    const updateResult = await update({
      col: "storeitemsorders",
      data: { _id: orderId },
      update: {
        orderStatus: "cancelled",
        paymentStatus: "refunded",
        cancelledAt: new Date(),
        cancelReason: "customer_request",
        stripeRefundId: refundResult?.id || null,
        refundAmount: order.total,
        refundedAt: new Date(),
        notes: order.notes
          ? `${
              order.notes
            }\n\nOrder cancelled and refunded on ${new Date().toISOString()}`
          : `Order cancelled and refunded on ${new Date().toISOString()}`,
      },
      skipOwnershipCheck: true, // We already validated ownership above
    });

    if (updateResult.error) {
      console.error("❌ Error updating order:", updateResult.error);
      return { error: "Failed to update order status" };
    }

    // Send cancellation notification to store owner
    try {
      console.log(
        `Sending cancellation notification to store owner for order ${order.orderNumber}`
      );
      const notificationResult =
        await sendOrderCancelledNotificationToStoreOwner({
          orderId: order._id,
        });

      if (notificationResult.error) {
        console.error(
          `❌ Failed to send cancellation notification:`,
          notificationResult.error
        );
        // Don't fail the cancellation if notification fails
      } else {
        console.log(
          `✅ Cancellation notification sent for order ${order.orderNumber}`
        );
      }
    } catch (notificationError) {
      console.error(
        `❌ Error sending cancellation notification:`,
        notificationError
      );
      // Don't fail the cancellation if notification fails
    }

    // Revalidate orders page
    revalidatePath("/orders");

    console.log(
      `✅ Order ${order.orderNumber} cancelled and refunded successfully`
    );

    return {
      success: true,
      refundId: refundResult?.id,
      refundAmount: order.total,
      message: "Order cancelled and refund processed successfully",
    };
  } catch (error) {
    console.error("❌ Error in cancelStoreItemOrder:", error);
    return {
      error: error.message || "Failed to cancel order",
    };
  }
};

// Helper function to check if order can be cancelled (for UI validation)
export const canCancelOrder = async ({ orderId }) => {
  try {
    const { mongoUser } = await getMongoUser();
    if (!mongoUser?._id) {
      return { canCancel: false, reason: "User not authenticated" };
    }

    const order = await getOne({
      col: "storeitemsorders",
      data: { _id: orderId },
    });

    if (!order) {
      return { canCancel: false, reason: "Order not found" };
    }

    // Check status
    if (
      order.orderStatus === "cancelled" ||
      order.paymentStatus === "refunded"
    ) {
      return { canCancel: false, reason: "Already cancelled" };
    }

    if (order.paymentStatus !== "paid") {
      return { canCancel: false, reason: "Order not paid" };
    }

    if (order.orderStatus === "shipped" || order.orderStatus === "delivered") {
      return { canCancel: false, reason: "Already shipped" };
    }

    // Check time restriction
    const orderDate = new Date(order.createdAt);
    const currentDate = new Date();
    const timeDifference = currentDate.getTime() - orderDate.getTime();
    const daysDifference = timeDifference / (1000 * 3600 * 24);

    const isDevUser =
      mongoUser.isDev ||
      mongoUser.email?.includes("@dev.") ||
      mongoUser.email?.includes("@test.");

    if (!isDevUser && daysDifference < 7) {
      const remainingDays = Math.ceil(7 - daysDifference);
      return {
        canCancel: false,
        reason: `Available in ${remainingDays} day(s)`,
        daysRemaining: remainingDays,
      };
    }

    return { canCancel: true };
  } catch (error) {
    console.error("❌ Error in canCancelOrder:", error);
    return {
      canCancel: false,
      reason: "Error checking cancellation eligibility",
    };
  }
};
