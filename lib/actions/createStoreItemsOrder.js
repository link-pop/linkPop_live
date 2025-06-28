"use server";

import { add } from "./crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";

export const createStoreItemsOrder = async ({
  storeOwner,
  items,
  subtotal,
  stripeSessionId,
  shippingAddress = null,
  paymentStatus = "pending",
  orderStatus = "pending",
}) => {
  try {
    const { mongoUser } = await getMongoUser();
    if (!mongoUser) {
      return { error: "User not authenticated" };
    }

    // Generate order number manually
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const orderNumber = `ORD-${timestamp}-${random}`;

    // Create order record in database using CRUD add function
    const order = await add({
      col: "storeitemsorders",
      data: {
        createdBy: mongoUser._id,
        storeOwner: storeOwner._id,
        orderNumber: orderNumber,
        items: items,
        subtotal: subtotal,
        tax: 0, // Will be calculated by Stripe
        shipping: 0, // Will be calculated by Stripe
        total: subtotal, // Will be updated after payment
        stripeSessionId: stripeSessionId,
        paymentStatus: paymentStatus,
        orderStatus: orderStatus,
        ...(shippingAddress && { shippingAddress: shippingAddress }),
      },
    });

    if (order.error) {
      console.error("Error creating order:", order.error);
      return { error: order.error };
    }

    console.log("Order created:", order.orderNumber);
    return { success: true, order };
  } catch (error) {
    console.error("Error in createStoreItemsOrder:", error);
    return { error: error.message || "Failed to create order" };
  }
};

export const createMultipleStoreItemsOrders = async ({
  allOrders,
  stripeSessionId,
  shippingAddress = null,
  paymentStatus = "pending",
  orderStatus = "pending",
}) => {
  try {
    const createdOrders = [];

    for (const orderData of allOrders) {
      const result = await createStoreItemsOrder({
        storeOwner: orderData.storeOwner,
        items: orderData.items,
        subtotal: orderData.subtotal,
        stripeSessionId: stripeSessionId,
        shippingAddress: shippingAddress,
        paymentStatus: paymentStatus,
        orderStatus: orderStatus,
      });

      if (result.error) {
        console.error("Error creating order:", result.error);
        continue; // Continue with other orders
      }

      createdOrders.push(result.order);
    }

    return { success: true, orders: createdOrders };
  } catch (error) {
    console.error("Error in createMultipleStoreItemsOrders:", error);
    return { error: error.message || "Failed to create orders" };
  }
};
