"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/components/Context/TranslationContext";
import { useContext } from "@/components/Context/Context";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { getUserCartItemsGroupedByStoreOwner } from "@/lib/actions/userCartActions";
import { formatPrice } from "@/lib/utils/formatPrice";
import PostsLoader from "@/components/Post/Posts/PostsLoader";
import CartItemCard from "@/components/ui/shared/Cart/CartItemCard";
import CartStoreOwnerHeader from "@/components/ui/shared/Cart/CartStoreOwnerHeader";

export default function CartPageClient({ mongoUser }) {
  const { t } = useTranslation();
  const { toastSet } = useContext();
  const queryClient = useQueryClient();
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

  const handleItemUpdate = () => {
    // Refresh cart data when item is updated
    queryClient.invalidateQueries(["userCart", mongoUser._id]);
  };

  const handleItemRemove = () => {
    // Refresh cart data when item is removed
    queryClient.invalidateQueries(["userCart", mongoUser._id]);
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
    <div className="max-w-6xl mx-auto p20">
      {/* Header */}
      <div className="mb30">
        <h1 className="text-3xl font-bold mb10 text-foreground">{t("cart")}</h1>
        <div className="f aic g15 text-muted-foreground">
          <span className="f aic g5">
            <ShoppingCart size={18} />
            {getTotalItemCount()}{" "}
            {getTotalItemCount() === 1 ? t("item") : t("items")}
          </span>
          <span className="w1 h1 bg-muted-foreground rounded-full"></span>
          <span>
            {cartGroups.length}{" "}
            {cartGroups.length === 1 ? t("store") : t("stores")}
          </span>
        </div>
      </div>

      {/* Cart Groups by Store Owner */}
      <div className="fc g30 mb30">
        {cartGroups.map((group) => (
          <div
            key={group.storeOwner._id}
            className="bg-background border border-border rounded-xl p25 shadow-sm"
          >
            {/* Store Owner Header */}
            <CartStoreOwnerHeader
              storeOwner={group.storeOwner}
              totalItems={group.totalItems}
              subtotal={group.subtotal}
            />

            {/* Items from this store owner */}
            <div className="fc g15">
              {group.items.map((cartItem) => (
                <CartItemCard
                  key={cartItem._id}
                  cartItem={cartItem}
                  mongoUser={mongoUser}
                  onQuantityUpdate={handleItemUpdate}
                  onRemove={handleItemRemove}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Cart Summary */}
      <div className="bg-accent/10 border border-accent/30 rounded-xl p25 shadow-md">
        <div className="f jcsb aic mb20">
          <span className="text-2xl font-bold text-foreground">
            {t("total")}:
          </span>
          <span className="text-3xl font-bold text-accent-foreground">
            {formatPrice(calculateGrandTotal())}
          </span>
        </div>

        <div className="f g15">
          <Link
            href="/"
            className="flex-1 px25 py15 border border-border hover:bg-muted text-center rounded-xl transition-all duration-200 font-medium text-foreground"
          >
            {t("continueShoppingCart")}
          </Link>
          <button
            onClick={handleCheckout}
            disabled={isCheckingOut}
            className="flex-1 px25 py15 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl transition-all duration-200 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isCheckingOut ? t("processing") : t("proceedToCheckout")}
          </button>
        </div>
      </div>
    </div>
  );
}
