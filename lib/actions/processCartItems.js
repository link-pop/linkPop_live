"use server";

import { models } from "@/lib/db/models/models";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import { addDevStatus } from "@/lib/utils/mongo/addDevStatus";
import removeHtmlFromText from "@/lib/utils/removeHtmlFromText";

export const processCartItems = async () => {
  try {
    // Get the authenticated user
    const { mongoUser } = await getMongoUser();
    if (!mongoUser) {
      return { error: "User not authenticated" };
    }

    console.log("Authenticated user:", mongoUser._id);

    // Get user's cart items with properly populated files
    const cartItems = await models.usercarts
      .find({
        createdBy: mongoUser._id,
      })
      .populate([
        {
          path: "storeItemId",
          populate: {
            path: "files",
          },
        },
        "storeOwner",
      ]);

    if (!cartItems || cartItems.length === 0) {
      return { error: "Cart is empty" };
    }

    console.log(`Found ${cartItems.length} cart items`);

    // Validate stock availability for all items before processing
    const stockValidationErrors = [];
    for (const cartItem of cartItems) {
      const storeItem = cartItem.storeItemId;

      if (!storeItem) {
        stockValidationErrors.push(
          `Store item not found for cart item ${cartItem._id}`
        );
        continue;
      }

      // Check if item is out of stock
      if (!storeItem.stock || storeItem.stock <= 0) {
        stockValidationErrors.push(
          `${storeItem.title || "Store item"} is out of stock`
        );
        continue;
      }

      // Check if requested quantity exceeds available stock
      if (cartItem.quantity > storeItem.stock) {
        stockValidationErrors.push(
          `Only ${storeItem.stock} units of "${
            storeItem.title || "Store item"
          }" available, but ${cartItem.quantity} requested`
        );
        continue;
      }
    }

    // If there are stock validation errors, return them
    if (stockValidationErrors.length > 0) {
      return {
        error: "Stock validation failed",
        stockErrors: stockValidationErrors,
        details: stockValidationErrors.join("; "),
      };
    }

    // Group cart items by store owner
    const itemsByStoreOwner = {};

    cartItems.forEach((cartItem) => {
      const storeOwnerId = cartItem.storeOwner._id.toString();

      if (!itemsByStoreOwner[storeOwnerId]) {
        itemsByStoreOwner[storeOwnerId] = {
          storeOwner: addDevStatus(cartItem.storeOwner), // Add isDev flag
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
                storeOwnerData.storeOwner.name ||
                storeOwnerData.storeOwner.displayName
              })`,
              description: removeHtmlFromText(storeItem.text) || "",
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
          storeOwner: addDevStatus(storeOwnerData.storeOwner), // Ensure isDev flag is added
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
