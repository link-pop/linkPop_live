"use server";

import { add, removeOne, getAll, getOne, update } from "./crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";

// Add item to user cart
export const addToUserCart = async ({ storeItemId, quantity = 1 }) => {
  try {
    const { mongoUser } = await getMongoUser();
    if (!mongoUser?._id) {
      return { error: "User not authenticated" };
    }

    // Check if item already exists in cart
    const existingCartItem = await getOne({
      col: "usercarts",
      data: {
        createdBy: mongoUser._id,
        storeItemId: storeItemId,
      },
    });

    if (existingCartItem) {
      return { error: "Item already in cart" };
    }

    // Add item to cart
    const result = await add({
      col: "usercarts",
      data: {
        createdBy: mongoUser._id,
        storeItemId: storeItemId,
        quantity: quantity,
      },
    });

    return result;
  } catch (error) {
    console.error("Error adding to cart:", error);
    return { error: error.message || "Failed to add item to cart" };
  }
};

// Remove item from user cart
export const removeFromUserCart = async ({ storeItemId }) => {
  try {
    const { mongoUser } = await getMongoUser();
    if (!mongoUser?._id) {
      return { error: "User not authenticated" };
    }

    const result = await removeOne({
      col: "usercarts",
      data: {
        createdBy: mongoUser._id,
        storeItemId: storeItemId,
      },
    });

    return result;
  } catch (error) {
    console.error("Error removing from cart:", error);
    return { error: error.message || "Failed to remove item from cart" };
  }
};

// Get user cart items
export const getUserCartItems = async () => {
  try {
    const { mongoUser } = await getMongoUser();
    if (!mongoUser?._id) {
      return { error: "User not authenticated" };
    }

    const cartItems = await getAll({
      col: "usercarts",
      data: {
        createdBy: mongoUser._id,
      },
      populate: "storeItemId",
      sort: { createdAt: -1 },
    });

    return cartItems;
  } catch (error) {
    console.error("Error getting cart items:", error);
    return { error: error.message || "Failed to get cart items" };
  }
};

// Get cart item count
export const getUserCartCount = async () => {
  try {
    const { mongoUser } = await getMongoUser();
    if (!mongoUser?._id) {
      return 0;
    }

    const cartItems = await getAll({
      col: "usercarts",
      data: {
        createdBy: mongoUser._id,
      },
    });

    return cartItems?.length || 0;
  } catch (error) {
    console.error("Error getting cart count:", error);
    return 0;
  }
};

// Check if item is in cart
export const isItemInUserCart = async ({ storeItemId }) => {
  try {
    const { mongoUser } = await getMongoUser();
    if (!mongoUser?._id) {
      return false;
    }

    const cartItem = await getOne({
      col: "usercarts",
      data: {
        createdBy: mongoUser._id,
        storeItemId: storeItemId,
      },
    });

    return !!cartItem;
  } catch (error) {
    console.error("Error checking cart item:", error);
    return false;
  }
};

// Update cart item quantity
export const updateCartItemQuantity = async ({ storeItemId, quantity }) => {
  try {
    const { mongoUser } = await getMongoUser();
    if (!mongoUser?._id) {
      return { error: "User not authenticated" };
    }

    if (quantity < 1) {
      return { error: "Quantity must be at least 1" };
    }

    const result = await update({
      col: "usercarts",
      data: {
        createdBy: mongoUser._id,
        storeItemId: storeItemId,
      },
      update: {
        quantity: quantity,
      },
    });

    return result;
  } catch (error) {
    console.error("Error updating cart quantity:", error);
    return { error: error.message || "Failed to update cart quantity" };
  }
};

// Clear user cart
export const clearUserCart = async () => {
  try {
    const { mongoUser } = await getMongoUser();
    if (!mongoUser?._id) {
      return { error: "User not authenticated" };
    }

    const cartItems = await getAll({
      col: "usercarts",
      data: {
        createdBy: mongoUser._id,
      },
    });

    if (!cartItems || cartItems.length === 0) {
      console.log("Cart is already empty");
      return { success: true, message: "Cart is already empty" };
    }

    // Remove all cart items using removeOne to ensure proper ownership checks
    const deletePromises = cartItems.map((item) =>
      removeOne({
        col: "usercarts",
        data: { _id: item._id },
        revalidate: "/cart", // Revalidate cart page
      })
    );

    const results = await Promise.allSettled(deletePromises);

    // Check if any deletions failed
    const failures = results.filter(
      (result) => result.status === "rejected" || result.value?.error
    );
    if (failures.length > 0) {
      console.error("Some cart items failed to delete:", failures);
      return { error: "Some items could not be removed from cart" };
    }

    console.log(`Successfully cleared ${cartItems.length} cart items`);
    return { success: true, cleared: cartItems.length };
  } catch (error) {
    console.error("Error clearing cart:", error);
    return { error: error.message || "Failed to clear cart" };
  }
};
