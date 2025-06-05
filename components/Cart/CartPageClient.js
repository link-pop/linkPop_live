"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/components/Context/TranslationContext";
import { useContext } from "@/components/Context/Context";
import { getAll, removeOne, update } from "@/lib/actions/crud";
import { formatPrice } from "@/lib/utils/formatPrice";
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import { useState, useEffect } from "react";
import PostsLoader from "@/components/Post/Posts/PostsLoader";
import Link from "next/link";
import StripeButton from "@/components/Stripe/StripeButton";
import { ORDERS_ROUTE } from "@/lib/utils/constants";

export default function CartPageClient({ mongoUser }) {
  const { t } = useTranslation();
  const { toastSet } = useContext();
  const queryClient = useQueryClient();
  const [loadingItems, setLoadingItems] = useState(new Set());

  // Refresh cart data when page becomes visible (e.g., returning from checkout)
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
    data: cartItems = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["userCart", mongoUser?._id],
    queryFn: async () => {
      if (!mongoUser?._id) return [];

      try {
        const items = await getAll({
          col: "usercarts",
          data: {
            createdBy: mongoUser._id,
          },
          populate: "storeItemId",
          sort: { createdAt: -1 },
        });

        return items || [];
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

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.storeItemId?.price || 0;
      return total + price * item.quantity;
    }, 0);
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

  if (!cartItems.length) {
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
          {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
        </p>
      </div>

      <div className="fc g15">
        {cartItems.map((cartItem) => {
          const storeItem = cartItem.storeItemId;
          const isLoading = loadingItems.has(cartItem._id);

          if (!storeItem) {
            return null; // Skip if store item was deleted
          }

          return (
            <div
              key={cartItem._id}
              className={`f g15 p15 border rounded-lg bg-background ${
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
                    {storeItem.title || "Untitled Item"}
                  </h3>
                  {storeItem.category && (
                    <p className="text-sm text-muted-foreground uppercase tracking-wide">
                      {storeItem.category}
                    </p>
                  )}
                  {storeItem.text && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt5">
                      {storeItem.text}
                    </p>
                  )}
                </div>

                <div className="f aic jcsb">
                  {/* Quantity Controls */}
                  <div className="f aic g10">
                    <span className="text-sm text-muted-foreground">
                      {t("quantity")}:
                    </span>
                    <div className="f aic g5 border rounded-lg px8 py5">
                      <button
                        onClick={() =>
                          updateQuantity(cartItem._id, cartItem.quantity - 1)
                        }
                        disabled={cartItem.quantity <= 1 || isLoading}
                        className="f aic jcc w20 h20 rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="min-w-[30px] text-center text-sm font-medium">
                        {cartItem.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(cartItem._id, cartItem.quantity + 1)
                        }
                        disabled={isLoading}
                        className="f aic jcc w20 h20 rounded hover:bg-muted"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Price and Remove */}
                  <div className="f aic g15">
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {formatPrice(storeItem.price * cartItem.quantity)}
                      </div>
                      {cartItem.quantity > 1 && (
                        <div className="text-sm text-muted-foreground">
                          {formatPrice(storeItem.price)} each
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeFromCart(cartItem._id)}
                      disabled={isLoading}
                      className="p8 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      title={t("removeFromCart")}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cart Summary */}
      <div className="mt20 p20 border rounded-lg bg-muted/50">
        <div className="f jcsb aic mb15">
          <span className="text-lg font-semibold">{t("total")}:</span>
          <span className="text-2xl font-bold">
            {formatPrice(calculateTotal())}
          </span>
        </div>

        <div className="f g10">
          <Link
            href="/"
            className="flex-1 px20 py10 border border-border hover:bg-muted text-center rounded-lg transition-colors"
          >
            {t("continueShoppingCart")}
          </Link>
          <Link
            href={ORDERS_ROUTE}
            className="flex-1 px20 py10 border border-border hover:bg-muted text-center rounded-lg transition-colors"
          >
            {t("viewOrders")}
          </Link>
          <div className="flex-1">
            <StripeButton postType="cart" disabled={!cartItems.length}>
              {t("proceedToCheckout")}
            </StripeButton>
          </div>
        </div>
      </div>
    </div>
  );
}
