"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/components/Context/TranslationContext";
import { useContext } from "@/components/Context/Context";
import { ShoppingCart, Minus, Plus, Trash2, Store } from "lucide-react";
import Link from "next/link";
import { update, removeOne } from "@/lib/actions/crud";
import { getUserCartItemsGroupedByStoreOwner } from "@/lib/actions/userCartActions";
import { formatPrice } from "@/lib/utils/formatPrice";
import PostsLoader from "@/components/Post/Posts/PostsLoader";

export default function CartPageClient({ mongoUser }) {
  const { t } = useTranslation();
  const { toastSet } = useContext();
  const queryClient = useQueryClient();
  const [loadingItems, setLoadingItems] = useState(new Set());
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Refresh cart when page becomes visible (e.g., returning from another page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && mongoUser?._id) {
        queryClient.invalidateQueries(["userCart", mongoUser._id]);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [mongoUser?._id, queryClient]);

  const {
    data: cartGroups = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["userCart", mongoUser?._id],
    queryFn: async () => {
      if (!mongoUser?._id) return [];

      try {
        const groups = await getUserCartItemsGroupedByStoreOwner();
        return groups.error ? [] : groups;
      } catch (error) {
        console.error("Error fetching cart items:", error);
        return [];
      }
    },
    enabled: Boolean(mongoUser?._id),
  });

  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;

    setLoadingItems((prev) => new Set(prev).add(cartItemId));

    try {
      const result = await update({
        col: "usercarts",
        data: { _id: cartItemId },
        update: { quantity: newQuantity },
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      // Refresh cart data
      queryClient.invalidateQueries(["userCart", mongoUser._id]);

      toastSet({
        isOpen: true,
        title: t("cartUpdated"),
      });
    } catch (error) {
      console.error("Error updating quantity:", error);
      toastSet({
        isOpen: true,
        title: t("errorAddingToCart"),
        text: error.message || "An error occurred",
      });
    } finally {
      setLoadingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
    }
  };

  const removeFromCart = async (cartItemId) => {
    setLoadingItems((prev) => new Set(prev).add(cartItemId));

    try {
      const result = await removeOne({
        col: "usercarts",
        data: { _id: cartItemId },
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      // Refresh cart data
      queryClient.invalidateQueries(["userCart", mongoUser._id]);

      toastSet({
        isOpen: true,
        title: t("removedFromCart"),
      });
    } catch (error) {
      console.error("Error removing from cart:", error);
      toastSet({
        isOpen: true,
        title: t("errorRemovingFromCart"),
        text: error.message || "An error occurred",
      });
    } finally {
      setLoadingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
    }
  };

  const calculateGrandTotal = () => {
    return cartGroups.reduce((total, group) => total + group.subtotal, 0);
  };

  const getTotalItemCount = () => {
    return cartGroups.reduce((total, group) => total + group.totalItems, 0);
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);

    try {
      const response = await fetch("/api/stripe/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.sessionUrl) {
        // Redirect to Stripe checkout
        window.location.href = data.sessionUrl;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toastSet({
        isOpen: true,
        title: t("errorProcessingCheckout"),
        text: error.message || "An error occurred during checkout",
      });
      setIsCheckingOut(false);
    }
  };

  if (!mongoUser?._id) {
    return (
      <div className="fcc min-h-screen p20">
        <div className="text-center">
          <ShoppingCart className="w40 h40 text-muted-foreground mx-auto mb10" />
          <h2 className="text-xl font-semibold mb5">{t("cart")}</h2>
          <p className="text-muted-foreground">{t("pleaseLoginToSearch")}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="fcc min-h-screen">
        <PostsLoader isLoading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="fcc min-h-screen p20">
        <div className="text-center">
          <p className="text-destructive">{t("errorLoadingStoreItems")}</p>
        </div>
      </div>
    );
  }

  if (!cartGroups.length) {
    return (
      <div className="fcc min-h-screen p20">
        <div className="text-center">
          <ShoppingCart className="w40 h40 text-muted-foreground mx-auto mb10" />
          <h2 className="text-xl font-semibold mb5">{t("cart")}</h2>
          <p className="text-muted-foreground mb15">{t("cartEmpty")}</p>
          <Link
            href="/"
            className="px20 py10 bg-accent hover:bg-accent/80 text-accent-foreground rounded-lg transition-colors"
          >
            {t("continueShoppingCart")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p20">
      <div className="mb20">
        <h1 className="text-2xl font-bold mb5">{t("cart")}</h1>
        <p className="text-muted-foreground">
          {getTotalItemCount()} {getTotalItemCount() === 1 ? "item" : "items"}{" "}
          from {cartGroups.length}{" "}
          {cartGroups.length === 1 ? "store" : "stores"}
        </p>
      </div>

      {/* Cart Groups by Store Owner */}
      <div className="fc g20">
        {cartGroups.map((group, groupIndex) => (
          <div
            key={group.storeOwner._id}
            className="border rounded-lg bg-background p20"
          >
            {/* Store Owner Header */}
            <div className="f aic g10 mb15 pb15 border-b">
              <Store className="w20 h20 text-muted-foreground" />
              <div>
                <h2 className="font-semibold text-lg">
                  {group.storeOwner.username ||
                    group.storeOwner.email ||
                    "Unknown Store Owner"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {group.totalItems} {group.totalItems === 1 ? "item" : "items"}{" "}
                  • {formatPrice(group.subtotal)}
                </p>
              </div>
            </div>

            {/* Items from this store owner */}
            <div className="fc g15">
              {group.items.map((cartItem) => {
                const storeItem = cartItem.storeItemId;
                const isLoading = loadingItems.has(cartItem._id);

                if (!storeItem) {
                  return null; // Skip if store item was deleted
                }

                return (
                  <div
                    key={cartItem._id}
                    className={`f g15 p15 border rounded-lg bg-muted/30 ${
                      isLoading ? "opacity-50" : ""
                    }`}
                  >
                    {/* Store Item Image */}
                    <div className="w80 h80 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                      {storeItem.files?.[0]?.fileUrl ? (
                        <img
                          src={storeItem.files[0].fileUrl}
                          alt={storeItem.title || "Store item"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full fcc">
                          <ShoppingCart className="w30 h30 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 fc g10">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {storeItem.title || t("storeItem")}
                        </h3>
                        {storeItem.category && (
                          <p className="text-sm text-muted-foreground uppercase tracking-wide">
                            {storeItem.category}
                          </p>
                        )}
                        {storeItem.text && (
                          <p className="text-sm text-muted-foreground mt5 line-clamp-2">
                            {storeItem.text}
                          </p>
                        )}
                      </div>

                      <div className="f jcsb aic">
                        <div className="text-lg font-bold">
                          {formatPrice(storeItem.price)}
                        </div>

                        {/* Quantity Controls */}
                        <div className="f aic g10">
                          <div className="f aic g5 border rounded-lg px8 py5 bg-background">
                            <button
                              onClick={() =>
                                updateQuantity(
                                  cartItem._id,
                                  cartItem.quantity - 1
                                )
                              }
                              disabled={cartItem.quantity <= 1 || isLoading}
                              className="f aic jcc w25 h25 rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="min-w-[40px] text-center font-medium">
                              {cartItem.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(
                                  cartItem._id,
                                  cartItem.quantity + 1
                                )
                              }
                              disabled={isLoading}
                              className="f aic jcc w25 h25 rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(cartItem._id)}
                            disabled={isLoading}
                            className="f aic jcc w35 h35 rounded-lg border border-destructive/20 hover:bg-destructive/10 text-destructive disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          {formatPrice(storeItem.price * cartItem.quantity)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatPrice(storeItem.price)} × {cartItem.quantity}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Cart Summary */}
      <div className="mt20 p20 border rounded-lg bg-background">
        <div className="f jcsb aic mb15">
          <span className="text-xl font-semibold">{t("total")}:</span>
          <span className="text-2xl font-bold">
            {formatPrice(calculateGrandTotal())}
          </span>
        </div>

        <div className="f g10">
          <Link
            href="/"
            className="flex-1 px20 py10 border border-border hover:bg-muted text-center rounded-lg transition-colors"
          >
            {t("continueShoppingCart")}
          </Link>
          <button
            onClick={handleCheckout}
            disabled={isCheckingOut}
            className="flex-1 px20 py10 bg-accent hover:bg-accent/80 text-accent-foreground rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCheckingOut ? t("processing") : t("proceedToCheckout")}
          </button>
        </div>
      </div>
    </div>
  );
}
