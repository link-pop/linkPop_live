"use server";

import { getAll, update } from "./crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";

export const dynamic = "force-dynamic";

// Calculate and update store earnings for a user
export const calculateStoreEarnings = async (userId = null) => {
  try {
    const { mongoUser } = await getMongoUser();
    const targetUserId = userId || mongoUser?._id;

    if (!targetUserId) {
      return { error: "User not authenticated" };
    }

    // Get all orders where user is the store owner (paid orders for earnings)
    const orders = await getAll({
      col: "storeitemsorders",
      data: {
        storeOwner: targetUserId,
        paymentStatus: "paid", // Only count paid orders
      },
      sort: { createdAt: -1 },
    });

    // Get all canceled orders to calculate canceled amount
    const canceledOrders = await getAll({
      col: "storeitemsorders",
      data: {
        storeOwner: targetUserId,
        orderStatus: "cancelled",
      },
      sort: { createdAt: -1 },
    });

    // Get all orders (including canceled) for total count
    const allOrders = await getAll({
      col: "storeitemsorders",
      data: {
        storeOwner: targetUserId,
      },
      sort: { createdAt: -1 },
    });

    if (
      (!orders || orders.length === 0) &&
      (!canceledOrders || canceledOrders.length === 0) &&
      (!allOrders || allOrders.length === 0)
    ) {
      // Update user with zero earnings
      const updateResult = await update({
        col: "users",
        data: { _id: targetUserId },
        update: {
          "storeEarnings.totalEarnings": 0,
          "storeEarnings.pendingEarnings": 0,
          "storeEarnings.transferredEarnings": 0,
          "storeEarnings.totalOrders": 0,
          "storeEarnings.totalItemsSold": 0,
          "storeEarnings.shippingRequiredCount": 0,
          "storeEarnings.processingOrdersCount": 0,
          "storeEarnings.shippedOrdersCount": 0,
          "storeEarnings.canceledOrdersCount": 0,
          "storeEarnings.canceledAmount": 0,
          "storeEarnings.lastEarningsUpdate": new Date(),
          "storeEarnings.monthlyEarnings": [],
        },
      });

      if (updateResult.error) {
        console.error(
          "Error updating user with zero earnings:",
          updateResult.error
        );
        return { error: updateResult.error };
      }

      return {
        totalEarnings: 0,
        pendingEarnings: 0,
        transferredEarnings: 0,
        totalOrders: 0,
        totalItemsSold: 0,
        shippingRequiredCount: 0,
        processingOrdersCount: 0,
        shippedOrdersCount: 0,
        canceledOrdersCount: 0,
        canceledAmount: 0,
        monthlyEarnings: [],
      };
    }

    // Calculate totals
    let totalEarnings = 0;
    let pendingEarnings = 0;
    let transferredEarnings = 0;
    let totalItemsSold = 0;
    let shippingRequiredCount = 0;
    let processingOrdersCount = 0;
    let shippedOrdersCount = 0;
    let canceledOrdersCount = 0;
    let canceledAmount = 0;
    const monthlyEarningsMap = {};

    // Process paid orders
    if (orders && orders.length > 0) {
      orders.forEach((order) => {
        // Use transferAmount if available, otherwise calculate from total minus platform fee
        let orderEarnings = 0;
        if (order.transferAmount && order.transferAmount > 0) {
          orderEarnings = order.transferAmount;
        } else if (order.total && order.total > 0) {
          // Fallback: calculate earnings as total minus platform fee (20%)
          const platformFeeAmount = order.platformFee || order.total * 0.2;
          orderEarnings = order.total - platformFeeAmount;
        }

        totalEarnings += orderEarnings;

        // Count items sold
        if (order.items && Array.isArray(order.items)) {
          const itemsInOrder = order.items.reduce(
            (sum, item) => sum + (item.quantity || 0),
            0
          );
          totalItemsSold += itemsInOrder;
        }

        // Count orders that require shipping (processing status)
        if (order.orderStatus === "processing") {
          shippingRequiredCount += 1;
        }

        // Categorize earnings by transfer status
        if (order.transferStatus === "completed" || order.devMode) {
          transferredEarnings += orderEarnings;
        } else {
          // Pending earnings should only include orders with orderStatus "shipped" or "delivered"
          if (
            order.orderStatus === "shipped" ||
            order.orderStatus === "delivered"
          ) {
            pendingEarnings += orderEarnings;
          }
        }

        // Group by month/year
        if (order.createdAt) {
          const date = new Date(order.createdAt);
          const month = date.getMonth() + 1; // 1-12
          const year = date.getFullYear();
          const key = `${year}-${month}`;

          if (!monthlyEarningsMap[key]) {
            monthlyEarningsMap[key] = {
              month,
              year,
              earnings: 0,
              orders: 0,
              itemsSold: 0,
            };
          }

          monthlyEarningsMap[key].earnings += orderEarnings;
          monthlyEarningsMap[key].orders += 1;
          monthlyEarningsMap[key].itemsSold += order.items
            ? order.items.reduce((sum, item) => sum + (item.quantity || 0), 0)
            : 0;
        }
      });
    }

    // Process canceled orders
    if (canceledOrders && canceledOrders.length > 0) {
      canceledOrdersCount = canceledOrders.length;
      canceledOrders.forEach((order) => {
        // Use refundAmount if available, otherwise use the full order total
        let canceledOrderAmount = 0;
        if (order.refundAmount && order.refundAmount > 0) {
          canceledOrderAmount = order.refundAmount;
        } else if (order.total && order.total > 0) {
          canceledOrderAmount = order.total;
        }

        canceledAmount += canceledOrderAmount;
      });
    }

    // Count orders by status from all orders
    if (allOrders && allOrders.length > 0) {
      allOrders.forEach((order) => {
        if (order.orderStatus === "processing") {
          processingOrdersCount += 1;
        } else if (order.orderStatus === "shipped") {
          shippedOrdersCount += 1;
        }
      });
    }

    // Convert monthly earnings to array and sort by date
    const monthlyEarnings = Object.values(monthlyEarningsMap).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

    const earningsData = {
      totalEarnings: Math.round(totalEarnings * 100) / 100, // Round to 2 decimal places
      pendingEarnings: Math.round(pendingEarnings * 100) / 100,
      transferredEarnings: Math.round(transferredEarnings * 100) / 100,
      totalOrders: allOrders ? allOrders.length : 0, // Include all orders (even canceled)
      totalItemsSold,
      shippingRequiredCount,
      processingOrdersCount,
      shippedOrdersCount,
      canceledOrdersCount,
      canceledAmount: Math.round(canceledAmount * 100) / 100, // Round to 2 decimal places
      monthlyEarnings,
    };

    // Update user with calculated earnings
    const updateResult = await update({
      col: "users",
      data: { _id: targetUserId },
      update: {
        "storeEarnings.totalEarnings": earningsData.totalEarnings,
        "storeEarnings.pendingEarnings": earningsData.pendingEarnings,
        "storeEarnings.transferredEarnings": earningsData.transferredEarnings,
        "storeEarnings.totalOrders": earningsData.totalOrders,
        "storeEarnings.totalItemsSold": earningsData.totalItemsSold,
        "storeEarnings.shippingRequiredCount":
          earningsData.shippingRequiredCount,
        "storeEarnings.processingOrdersCount":
          earningsData.processingOrdersCount,
        "storeEarnings.shippedOrdersCount": earningsData.shippedOrdersCount,
        "storeEarnings.canceledOrdersCount": earningsData.canceledOrdersCount,
        "storeEarnings.canceledAmount": earningsData.canceledAmount,
        "storeEarnings.lastEarningsUpdate": new Date(),
        "storeEarnings.monthlyEarnings": earningsData.monthlyEarnings,
      },
    });

    if (updateResult.error) {
      console.error("Error updating user earnings:", updateResult.error);
      return { error: updateResult.error };
    }

    return earningsData;
  } catch (error) {
    console.error("Error calculating store earnings:", error);
    return { error: error.message || "Failed to calculate store earnings" };
  }
};

// Get store earnings for current user
export const getStoreEarnings = async () => {
  try {
    const { mongoUser } = await getMongoUser();
    if (!mongoUser?._id) {
      return { error: "User not authenticated" };
    }

    // Check if earnings need to be recalculated (older than 1 hour)
    const lastUpdate = mongoUser.storeEarnings?.lastEarningsUpdate;
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    if (!lastUpdate || new Date(lastUpdate) < oneHourAgo) {
      // Recalculate earnings
      return await calculateStoreEarnings(mongoUser._id);
    }

    // Return cached earnings
    return {
      totalEarnings: mongoUser.storeEarnings?.totalEarnings || 0,
      pendingEarnings: mongoUser.storeEarnings?.pendingEarnings || 0,
      transferredEarnings: mongoUser.storeEarnings?.transferredEarnings || 0,
      totalOrders: mongoUser.storeEarnings?.totalOrders || 0,
      totalItemsSold: mongoUser.storeEarnings?.totalItemsSold || 0,
      shippingRequiredCount:
        mongoUser.storeEarnings?.shippingRequiredCount || 0,
      processingOrdersCount:
        mongoUser.storeEarnings?.processingOrdersCount || 0,
      shippedOrdersCount: mongoUser.storeEarnings?.shippedOrdersCount || 0,
      canceledOrdersCount: mongoUser.storeEarnings?.canceledOrdersCount || 0,
      canceledAmount: mongoUser.storeEarnings?.canceledAmount || 0,
      monthlyEarnings: mongoUser.storeEarnings?.monthlyEarnings || [],
      lastEarningsUpdate: mongoUser.storeEarnings?.lastEarningsUpdate,
    };
  } catch (error) {
    console.error("Error getting store earnings:", error);
    return { error: error.message || "Failed to get store earnings" };
  }
};

// Update store earnings when an order is completed/transferred
export const updateStoreEarningsOnOrderChange = async (orderId) => {
  try {
    // Get the order to find the store owner
    const orders = await getAll({
      col: "storeitemsorders",
      data: { _id: orderId },
      populate: "storeOwner",
    });

    if (!orders || orders.length === 0) {
      return { error: "Order not found" };
    }

    const order = orders[0];
    const storeOwnerId = order.storeOwner?._id || order.storeOwner;

    if (!storeOwnerId) {
      return { error: "Store owner not found" };
    }

    // Recalculate earnings for the store owner
    const result = await calculateStoreEarnings(storeOwnerId);

    if (result.error) {
      console.error("Error recalculating earnings:", result.error);
    }

    return result;
  } catch (error) {
    console.error("Error updating store earnings on order change:", error);
    return { error: error.message || "Failed to update store earnings" };
  }
};
