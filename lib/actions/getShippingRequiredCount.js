"use server";

import { getAll } from "./crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";

// Get count of orders that require shipping (orderStatus = "processing")
export const getShippingRequiredCount = async () => {
  try {
    const { mongoUser } = await getMongoUser();
    if (!mongoUser?._id) {
      return { error: "User not authenticated" };
    }

    // Get all orders where user is the store owner and status is "processing"
    const processingOrders = await getAll({
      col: "storeitemsorders",
      data: {
        storeOwner: mongoUser._id,
        paymentStatus: "paid", // Only count paid orders
        orderStatus: "processing", // Orders that need shipping
      },
      sort: { createdAt: -1 },
    });

    return {
      success: true,
      count: processingOrders?.length || 0,
      orders: processingOrders || [],
    };
  } catch (error) {
    console.error("Error getting shipping required count:", error);
    return { error: error.message || "Failed to get shipping required count" };
  }
};
