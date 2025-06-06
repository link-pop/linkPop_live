"use server";

import { update, getOne } from "./crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";

export const updateOrderStatus = async ({ orderId, orderStatus }) => {
  try {
    const { mongoUser } = await getMongoUser();
    if (!mongoUser?._id) {
      return { error: "User not authenticated" };
    }

    if (!orderId) {
      return { error: "Order ID is required" };
    }

    if (!orderStatus) {
      return { error: "Order status is required" };
    }

    // Validate order status
    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(orderStatus)) {
      return { error: "Invalid order status" };
    }

    // First check if user has permission to update this order
    // Try to find order where user is the buyer (createdBy)
    let order = await getOne({
      col: "storeitemsorders",
      data: {
        _id: orderId,
        createdBy: mongoUser._id,
      },
    });

    // If not found as buyer, try to find order where user is the store owner
    if (!order) {
      order = await getOne({
        col: "storeitemsorders",
        data: {
          _id: orderId,
          storeOwner: mongoUser._id,
        },
      });
    }

    if (!order) {
      return { error: "Order not found or access denied" };
    }

    // Determine user role - handle both ObjectId and string formats
    const storeOwnerId = order.storeOwner?._id
      ? order.storeOwner._id.toString()
      : order.storeOwner?.toString();
    const createdById = order.createdBy?._id
      ? order.createdBy._id.toString()
      : order.createdBy?.toString();
    const currentUserId = mongoUser._id.toString();

    const isStoreOwner = storeOwnerId === currentUserId;
    const isBuyer = createdById === currentUserId;

    // Debug logging
    console.log("Order ownership check:", {
      orderId,
      currentUserId,
      storeOwnerId,
      createdById,
      isStoreOwner,
      isBuyer,
      orderStatus,
    });

    // Only store owners can update order status to "shipped" or "delivered"
    if (
      (orderStatus === "shipped" || orderStatus === "delivered") &&
      !isStoreOwner
    ) {
      return {
        error: "Only store owners can mark orders as shipped or delivered",
      };
    }

    // Update the order status
    const result = await update({
      col: "storeitemsorders",
      data: { _id: orderId },
      update: {
        orderStatus,
        ...(orderStatus === "shipped" && { shippedAt: new Date() }),
        ...(orderStatus === "delivered" && { deliveredAt: new Date() }),
      },
    });

    if (result?.error) {
      return { error: result.error };
    }

    return { success: true, order: result };
  } catch (error) {
    console.error("Error updating order status:", error);
    return { error: error.message || "Failed to update order status" };
  }
};
