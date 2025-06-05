"use client";

import { useQueryClient } from "@tanstack/react-query";
import { clearUserCart } from "@/lib/actions/userCartActions";

export function useCartOperations(mongoUser) {
  const queryClient = useQueryClient();

  const clearCartAndRefresh = async () => {
    try {
      // Clear cart items from database
      const result = await clearUserCart();

      if (result?.error) {
        console.warn("Cart clearing warning:", result.error);
        return { success: false, error: result.error };
      }

      // Invalidate and refetch cart queries
      if (mongoUser?._id) {
        queryClient.invalidateQueries(["userCart", mongoUser._id]);
        await queryClient.refetchQueries(["userCart", mongoUser._id]);
      }

      console.log("Cart successfully cleared and cache refreshed");
      return { success: true, cleared: result?.cleared || 0 };
    } catch (error) {
      console.error("Error in clearCartAndRefresh:", error);
      return { success: false, error: error.message };
    }
  };

  const refreshCartCache = () => {
    if (mongoUser?._id) {
      queryClient.invalidateQueries(["userCart", mongoUser._id]);
    }
  };

  return {
    clearCartAndRefresh,
    refreshCartCache,
  };
}
