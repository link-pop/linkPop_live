"use server";

import { update } from "./crud";
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

    // Update the order status with ownership check (handled by crud.js)
    const result = await update({
      col: "storeitemsorders",
      data: {
        _id: orderId,
        createdBy: mongoUser._id, // Ensure user owns this order
      },
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
