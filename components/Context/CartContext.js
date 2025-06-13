"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { getUserCartCount } from "@/lib/actions/userCartActions";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children, mongoUser }) => {
  // cartCount represents the number of unique store items in cart, not total quantity
  const [cartCount, setCartCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch initial cart count
  const fetchCartCount = async () => {
    if (!mongoUser?._id) {
      setCartCount(0);
      return;
    }

    try {
      setIsLoading(true);
      const count = await getUserCartCount();
      setCartCount(count);
    } catch (error) {
      console.error("❌ Error fetching cart count:", error);
      setCartCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize cart count when mongoUser changes
  useEffect(() => {
    fetchCartCount();
  }, [mongoUser?._id]);

  // Refresh cart count manually
  const refreshCartCount = async () => {
    await fetchCartCount();
  };

  // Update cart count directly (for optimistic updates)
  const updateCartCount = (newCount) => {
    setCartCount(Math.max(0, newCount));
  };

  // Increment cart count
  const incrementCartCount = (amount = 1) => {
    setCartCount((prev) => Math.max(0, prev + amount));
  };

  // Decrement cart count
  const decrementCartCount = (amount = 1) => {
    setCartCount((prev) => Math.max(0, prev - amount));
  };

  // Clear cart count
  const clearCartCount = () => {
    setCartCount(0);
  };

  const value = {
    cartCount,
    isLoading,
    refreshCartCount,
    updateCartCount,
    incrementCartCount,
    decrementCartCount,
    clearCartCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
