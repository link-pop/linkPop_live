"use server";

import { models } from "@/lib/db/models/models";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";

export const processCartItems = async () => {
  try {
    // Get the authenticated user
    const { mongoUser } = await getMongoUser();
    if (!mongoUser) {
      return { error: "User not authenticated" };
    }

    console.log("Authenticated user:", mongoUser._id);

    // Get user's cart items
    const cartItems = await models.usercarts
      .find({
        createdBy: mongoUser._id,
      })
      .populate("storeItemId storeOwner");

    if (!cartItems || cartItems.length === 0) {
      return { error: "Cart is empty" };
    }

    console.log(`Found ${cartItems.length} cart items`);

    // Group cart items by store owner
    const itemsByStoreOwner = {};

    cartItems.forEach((cartItem) => {
      const storeOwnerId = cartItem.storeOwner._id.toString();

      if (!itemsByStoreOwner[storeOwnerId]) {
        itemsByStoreOwner[storeOwnerId] = {
          storeOwner: cartItem.storeOwner,
          items: [],
        };
      }

      itemsByStoreOwner[storeOwnerId].items.push(cartItem);
    });

    // Process each store owner's items separately
    const allOrders = [];
    const allLineItems = [];

    for (const [storeOwnerId, storeOwnerData] of Object.entries(
      itemsByStoreOwner
    )) {
      let subtotal = 0;
      const orderItems = [];

      // Validate cart items and calculate total for this store owner
      for (const cartItem of storeOwnerData.items) {
        const storeItem = cartItem.storeItemId;

        if (!storeItem) {
          console.error(`Store item not found for cart item ${cartItem._id}`);
          continue;
        }

        if (!storeItem.price || storeItem.price <= 0) {
          console.error(`Invalid price for store item ${storeItem._id}`);
          continue;
        }

        const itemTotal = storeItem.price * cartItem.quantity;
        subtotal += itemTotal;

        // Prepare Stripe line item
        allLineItems.push({
          price_data: {
            currency: "usd",
            product_data: {
              name: `${storeItem.title || "Store Item"} (by ${
                storeOwnerData.storeOwner.username ||
                storeOwnerData.storeOwner.email
              })`,
              description: storeItem.text || "",
              images: storeItem.files?.[0]?.fileUrl
                ? [storeItem.files[0].fileUrl]
                : [],
            },
            unit_amount: Math.round(storeItem.price * 100), // Convert to cents
          },
          quantity: cartItem.quantity,
        });

        // Prepare order item for database
        orderItems.push({
          storeItemId: storeItem._id,
          quantity: cartItem.quantity,
          priceAtTime: storeItem.price,
          title: storeItem.title,
          category: storeItem.category,
        });
      }

      if (orderItems.length > 0) {
        allOrders.push({
          storeOwner: storeOwnerData.storeOwner,
          items: orderItems,
          subtotal: subtotal,
        });
      }
    }

    if (allLineItems.length === 0) {
      return { error: "No valid items in cart" };
    }

    return {
      success: true,
      cartItems,
      itemsByStoreOwner,
      allOrders,
      allLineItems,
      mongoUser,
    };
  } catch (error) {
    console.error("Error processing cart items:", error);
    return { error: error.message || "Failed to process cart items" };
  }
};
