"use client";

import { useCart } from "@/components/Context/CartContext";
import {
  addToUserCart as originalAddToUserCart,
  removeFromUserCart as originalRemoveFromUserCart,
  updateCartItemQuantity as originalUpdateCartItemQuantity,
  clearUserCart as originalClearUserCart,
} from "@/lib/actions/userCartActions";

export function useCartActionsWithContext() {
  const {
    incrementCartCount,
    decrementCartCount,
    clearCartCount,
    refreshCartCount,
  } = useCart();

  const addToUserCart = async (params) => {
    try {
      const result = await originalAddToUserCart(params);

      if (result && !result.error) {
        // Optimistically increment cart count by 1 (one unique item added)
        incrementCartCount(1);
      }

      return result;
    } catch (error) {
      console.error("❌ Error in addToUserCart:", error);
      // Refresh cart count to ensure accuracy
      await refreshCartCount();
      throw error;
    }
  };

  const removeFromUserCart = async (params) => {
    try {
      const result = await originalRemoveFromUserCart(params);

      if (result && !result.error) {
        // Optimistically decrement cart count
        decrementCartCount(1);
      }

      return result;
    } catch (error) {
      console.error("❌ Error in removeFromUserCart:", error);
      // Refresh cart count to ensure accuracy
      await refreshCartCount();
      throw error;
    }
  };

  const updateCartItemQuantity = async (params) => {
    try {
      const result = await originalUpdateCartItemQuantity(params);

      if (result && !result.error) {
        // No need to update cart count since we count unique items, not quantities
        // The number of unique items doesn't change when updating quantity
      }

      return result;
    } catch (error) {
      console.error("❌ Error in updateCartItemQuantity:", error);
      // Refresh cart count to ensure accuracy
      await refreshCartCount();
      throw error;
    }
  };

  const clearUserCart = async () => {
    try {
      const result = await originalClearUserCart();

      if (result && !result.error) {
        // Clear cart count
        clearCartCount();
      }

      return result;
    } catch (error) {
      console.error("❌ Error in clearUserCart:", error);
      // Refresh cart count to ensure accuracy
      await refreshCartCount();
      throw error;
    }
  };

  return {
    addToUserCart,
    removeFromUserCart,
    updateCartItemQuantity,
    clearUserCart,
  };
}
