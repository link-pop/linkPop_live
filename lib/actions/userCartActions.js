"use server";

import { add, removeOne, getAll, getOne, update } from "./crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import { addDevStatus } from "@/lib/utils/mongo/addDevStatus";

// Add item to user cart
export const addToUserCart = async ({ storeItemId, quantity = 1 }) => {
  try {
    const { mongoUser } = await getMongoUser();
    if (!mongoUser?._id) {
      return { error: "User not authenticated" };
    }

    // Get store item to find the store owner
    const storeItem = await getOne({
      col: "storeitems",
      data: { _id: storeItemId },
    });

    if (!storeItem) {
      return { error: "Store item not found" };
    }

    // Check if item already exists in cart
    const existingCartItem = await getOne({
      col: "usercarts",
      data: {
        createdBy: mongoUser._id,
        storeItemId: storeItemId,
        storeOwner: storeItem.createdBy,
      },
    });

    if (existingCartItem) {
      return { error: "Item already in cart" };
    }

    // Add item to cart with store owner
    const result = await add({
      col: "usercarts",
      data: {
        createdBy: mongoUser._id,
        storeItemId: storeItemId,
        storeOwner: storeItem.createdBy,
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

// Get user cart items grouped by store owner
export const getUserCartItemsGroupedByStoreOwner = async () => {
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
      populate: [
        {
          path: "storeItemId",
          populate: {
            path: "files",
          },
        },
        "storeOwner",
      ],
      sort: { createdAt: -1 },
    });

    if (!cartItems || cartItems.length === 0) {
      return [];
    }

    // Group cart items by store owner
    const groupedItems = {};
    const itemsToUpdate = []; // Track items that need storeOwner update

    cartItems.forEach((cartItem) => {
      // Handle cart items without storeOwner (migration case)
      if (!cartItem.storeOwner && cartItem.storeItemId?.createdBy) {
        cartItem.storeOwner = {
          _id: cartItem.storeItemId.createdBy,
          username: "Store Owner", // Placeholder
          email: "unknown@example.com", // Placeholder
        };

        // Add to update queue
        itemsToUpdate.push({
          cartItemId: cartItem._id,
          storeOwnerId: cartItem.storeItemId.createdBy,
        });
      }

      // Skip items without valid store owner
      if (!cartItem.storeOwner?._id) {
        console.warn("Cart item without valid store owner:", cartItem._id);
        return;
      }

      const storeOwnerId = cartItem.storeOwner._id.toString();

      if (!groupedItems[storeOwnerId]) {
        groupedItems[storeOwnerId] = {
          storeOwner: addDevStatus(cartItem.storeOwner), // Add isDev flag
          items: [],
          totalItems: 0,
          subtotal: 0,
        };
      }

      groupedItems[storeOwnerId].items.push(cartItem);
      groupedItems[storeOwnerId].totalItems += cartItem.quantity;
      groupedItems[storeOwnerId].subtotal +=
        cartItem.storeItemId.price * cartItem.quantity;
    });

    // Update cart items without storeOwner in background
    if (itemsToUpdate.length > 0) {
      console.log(
        `Updating ${itemsToUpdate.length} cart items with storeOwner field`
      );

      // Update in background without waiting
      Promise.all(
        itemsToUpdate.map((item) =>
          update({
            col: "usercarts",
            data: { _id: item.cartItemId },
            update: { storeOwner: item.storeOwnerId },
          })
        )
      )
        .then(() => {
          console.log("Cart items updated with storeOwner field");
        })
        .catch((error) => {
          console.error("Error updating cart items:", error);
        });
    }

    return Object.values(groupedItems);
  } catch (error) {
    console.error("Error getting grouped cart items:", error);
    return { error: error.message || "Failed to get cart items" };
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

// Get orders for store owner (orders where user is the store owner)
export const getStoreOwnerOrders = async () => {
  try {
    const { mongoUser } = await getMongoUser();
    if (!mongoUser?._id) {
      return { error: "User not authenticated" };
    }

    const orders = await getAll({
      col: "storeitemsorders",
      data: {
        storeOwner: mongoUser._id,
      },
      populate: [
        {
          path: "items.storeItemId",
          populate: {
            path: "files",
          },
        },
        "createdBy",
      ],
      sort: { createdAt: -1 },
    });

    return orders || [];
  } catch (error) {
    console.error("Error getting store owner orders:", error);
    return { error: error.message || "Failed to get store owner orders" };
  }
};

// Get user's own orders (orders where user is the buyer)
export const getUserOrders = async () => {
  try {
    const { mongoUser } = await getMongoUser();
    if (!mongoUser?._id) {
      return { error: "User not authenticated" };
    }

    const orders = await getAll({
      col: "storeitemsorders",
      data: {
        createdBy: mongoUser._id,
      },
      populate: [
        {
          path: "items.storeItemId",
          populate: {
            path: "files",
          },
        },
        "storeOwner",
      ],
      sort: { createdAt: -1 },
    });

    return orders || [];
  } catch (error) {
    console.error("Error getting user orders:", error);
    return { error: error.message || "Failed to get user orders" };
  }
};

// Check if user is store owner of an order
export const isUserStoreOwnerOfOrder = async (orderId) => {
  try {
    const { mongoUser } = await getMongoUser();
    if (!mongoUser?._id) {
      return false;
    }

    const order = await getOne({
      col: "storeitemsorders",
      data: {
        _id: orderId,
        storeOwner: mongoUser._id,
      },
    });

    return !!order;
  } catch (error) {
    console.error("Error checking store owner:", error);
    return false;
  }
};

// Migration function to update existing cart items without storeOwner
export const migrateCartItemsWithoutStoreOwner = async () => {
  try {
    const { mongoUser } = await getMongoUser();
    if (!mongoUser?._id) {
      return { error: "User not authenticated" };
    }

    // Get all cart items without storeOwner field
    const cartItemsWithoutStoreOwner = await getAll({
      col: "usercarts",
      data: {
        createdBy: mongoUser._id,
        storeOwner: { $exists: false },
      },
      populate: "storeItemId",
    });

    if (
      !cartItemsWithoutStoreOwner ||
      cartItemsWithoutStoreOwner.length === 0
    ) {
      return { success: true, message: "No cart items need migration" };
    }

    console.log(
      `Found ${cartItemsWithoutStoreOwner.length} cart items without storeOwner field`
    );

    // Update each cart item with storeOwner
    const updatePromises = cartItemsWithoutStoreOwner.map(async (cartItem) => {
      if (!cartItem.storeItemId) {
        // Remove cart items with invalid storeItemId
        return removeOne({
          col: "usercarts",
          data: { _id: cartItem._id },
        });
      }

      return update({
        col: "usercarts",
        data: { _id: cartItem._id },
        update: {
          storeOwner: cartItem.storeItemId.createdBy,
        },
      });
    });

    const results = await Promise.allSettled(updatePromises);

    const successful = results.filter(
      (r) => r.status === "fulfilled" && !r.value?.error
    ).length;
    const failed = results.length - successful;

    console.log(
      `Migration completed: ${successful} successful, ${failed} failed`
    );

    return {
      success: true,
      migrated: successful,
      failed: failed,
      message: `Migrated ${successful} cart items`,
    };
  } catch (error) {
    console.error("Error migrating cart items:", error);
    return { error: error.message || "Failed to migrate cart items" };
  }
};
