"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useContext as useAppContext } from "@/components/Context/Context";
import { add, update, getOne } from "@/lib/actions/crud";
import { usePathname } from "next/navigation";

const CartContext = createContext();

export function CartProvider({ children }) {
  const { mongoUser } = useAppContext();
  const [cartItems, setCartItems] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const pathname = usePathname();

  // * Load cart from database on mount and when user changes
  const loadCart = async (userId) => {
    if (!userId) {
      setCartItems([]);
      setIsInitialized(true);
      return;
    }

    try {
      const cart = await getOne({
        col: "carts",
        data: { userId },
        populate: "items.productId",
      });

      if (cart && cart.items) {
        // Transform items to include product data
        const items = cart.items
          .map((item) => {
            if (!item.productId) {
              console.warn("Missing productId for item:", item);
              return null;
            }
            // Get the raw document data
            const productData = item.productId._doc || item.productId;
            return {
              ...productData,
              quantity: item.quantity,
            };
          })
          .filter(Boolean); // Remove null items

        setCartItems(items);
      } else if (userId === mongoUser?._id) {
        // Create new cart only for the current user
        await add({
          col: "carts",
          data: { userId, items: [] },
          revalidate: false,
        });
        setCartItems([]);
      }
    } catch (error) {
      console.error("Error loading cart:", error);
      setCartItems([]);
    }
    setIsInitialized(true);
  };

  // ! 1. load my cart on mount (=> 2 load = passed user's cart)
  useEffect(() => {
    // don't load MY cart here, coz we're loading passed user's cart
    if (pathname.includes("/users/")) return;
    loadCart(mongoUser?._id);
  }, [mongoUser, pathname]);

  // * addToCart
  const addToCart = async (product, quantityToAdd = 1) => {
    if (!mongoUser || quantityToAdd < 1) return;

    try {
      console.log(
        "Adding product to cart:",
        product,
        "quantity:",
        quantityToAdd
      );
      const existingItemIndex = cartItems.findIndex(
        (item) => item._id === product._id
      );
      let updatedCartItems;

      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        updatedCartItems = cartItems.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantityToAdd }
            : item
        );
      } else {
        // Add new item with product data
        updatedCartItems = [
          ...cartItems,
          { ...product, quantity: quantityToAdd },
        ];
      }

      // Convert to database format
      const dbItems = updatedCartItems.map((item) => ({
        productId: item._id,
        quantity: item.quantity,
      }));

      console.log("Updating cart in DB:", dbItems);
      const result = await update({
        col: "carts",
        data: { userId: mongoUser._id },
        update: { items: dbItems },
        revalidate: false,
      });

      if (result) {
        console.log("Cart updated successfully:", updatedCartItems);
        setCartItems(updatedCartItems);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  // * removeFromCart
  const removeFromCart = async (productId) => {
    if (!mongoUser) return;

    try {
      const updatedCartItems = cartItems.filter(
        (item) => item._id !== productId
      );

      // Convert to database format
      const dbItems = updatedCartItems.map((item) => ({
        productId: item._id,
        quantity: item.quantity,
      }));

      const result = await update({
        col: "carts",
        data: { userId: mongoUser._id },
        update: { items: dbItems },
        revalidate: false,
      });

      if (result) {
        setCartItems(updatedCartItems);
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };

  // * updateQuantity
  const updateQuantity = async (productId, newQuantity) => {
    if (!mongoUser || newQuantity < 0) return;

    try {
      let updatedCartItems;

      if (newQuantity === 0) {
        updatedCartItems = cartItems.filter((item) => item._id !== productId);
      } else {
        updatedCartItems = cartItems.map((item) =>
          item._id === productId ? { ...item, quantity: newQuantity } : item
        );
      }

      // Convert to database format
      const dbItems = updatedCartItems.map((item) => ({
        productId: item._id,
        quantity: item.quantity,
      }));

      const result = await update({
        col: "carts",
        data: { userId: mongoUser._id },
        update: { items: dbItems },
        revalidate: false,
      });

      if (result) {
        setCartItems(updatedCartItems);
      }
    } catch (error) {
      console.error("Error updating cart quantity:", error);
    }
  };

  // * getCartTotal
  const getCartTotal = () => {
    if (!cartItems.length) return 0;

    return cartItems.reduce((total, item) => {
      const price = item["discounted price"] || item.price || 0;
      return total + price * item.quantity;
    }, 0);
  };

  // * Provider value
  const value = {
    mongoUser,
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    isInitialized,
    loadCart, // Export loadCart function
  };

  // * Provider
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// * Hook
export function useCart(passedUser) {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  const {
    mongoUser: contextUser,
    cartItems,
    getCartTotal,
    isInitialized,
    loadCart,
  } = context;

  // ! 2. load passed user's cart on mount
  useEffect(() => {
    if (passedUser?._id) {
      loadCart(passedUser._id);
    }
  }, [passedUser?._id, contextUser?._id]);

  // If viewing another user's cart
  const targetUser = passedUser || contextUser;
  const isOwnCart =
    !passedUser || (contextUser && targetUser._id === contextUser._id);

  // Return read-only version for other users' carts
  if (!isOwnCart) {
    return {
      cartItems,
      getCartTotal,
      isInitialized,
      // Disable modification methods
      addToCart: () => {},
      removeFromCart: () => {},
      updateQuantity: () => {},
      loadCart: () => {}, // Disable loadCart for other users
    };
  }

  return context;
}
