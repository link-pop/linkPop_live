"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/components/Context/TranslationContext";
import { useContext } from "@/components/Context/Context";
import { useCart } from "@/components/Context/CartContext";
import { ShoppingCart } from "lucide-react";
import { getUserCartItemsGroupedByStoreOwner } from "@/lib/actions/userCartActions";
import { formatPrice } from "@/lib/utils/formatPrice";
import PostsLoader from "@/components/Post/Posts/PostsLoader";
import CartItemCard from "@/components/ui/shared/Cart/CartItemCard";
import CartStoreOwnerHeader from "@/components/ui/shared/Cart/CartStoreOwnerHeader";
import CartShippingAddressForm from "@/components/ui/shared/Cart/CartShippingAddressForm";
import CartSummary from "@/components/ui/shared/Cart/CartSummary";
import useWindowWidth from "@/hooks/useWindowWidth";

export default function CartPageClient({ mongoUser }) {
  const { t } = useTranslation();
  const { toastSet } = useContext();
  const { refreshCartCount } = useCart();
  const queryClient = useQueryClient();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [shippingAddress, setShippingAddress] = useState(null);
  const [shippingCost, setShippingCost] = useState(0);
  const { isMobileSm } = useWindowWidth();

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
    // No need to refresh cart count since we count unique items, not quantities
  };

  const handleItemRemove = () => {
    // Refresh cart data when item is removed
    queryClient.invalidateQueries(["userCart", mongoUser._id]);
    refreshCartCount();
  };

  const calculateGrandTotal = () => {
    return cartGroups.reduce((total, group) => total + group.subtotal, 0);
  };

  const calculateTotalWithShipping = () => {
    return calculateGrandTotal() + shippingCost;
  };

  const getTotalItemCount = () => {
    return cartGroups.reduce((total, group) => total + group.totalItems, 0);
  };

  const handleCheckout = async () => {
    // Validate shipping address is provided
    if (!shippingAddress) {
      toastSet({
        isOpen: true,
        title: t("shippingAddressRequired"),
        text: t("pleaseProvideShippingAddress"),
      });
      return;
    }

    // Validate shipping cost is calculated
    if (shippingCost <= 0) {
      toastSet({
        isOpen: true,
        title: t("shippingCostRequired"),
        text: t("pleaseCalculateShippingCost"),
      });
      return;
    }

    setIsCheckingOut(true);

    try {
      const response = await fetch("/api/stripe/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shippingAddress,
          shippingCost,
        }),
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
          <p className="text-muted-foreground">{t("cartEmpty")}</p>
        </div>
      </div>
    );
  }

  const isCheckoutDisabled =
    isCheckingOut || !shippingAddress || shippingCost <= 0;

  return (
    <div className="max-w-7xl mx-auto p20">
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

      {/* Main Content - Desktop: Side by side, Mobile: Stacked */}
      <div className="fr g30 aic-start">
        {/* Left Side: Cart Items */}
        <div className="flex-1 fc g30">
          {/* Cart Groups by Store Owner */}
          {cartGroups.map((group) => (
            <div
              key={group.storeOwner._id}
              className="bg-background rounded-xl shadow-sm"
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

        {/* Right Side: Shipping & Summary - Desktop Only */}
        <div className="hidden lg:block maw400 wf fc g20">
          {/* Shipping Address Form */}
          <CartShippingAddressForm
            onShippingAddressChange={setShippingAddress}
            onShippingCostChange={setShippingCost}
            cartGroups={cartGroups}
            isLoading={isCheckingOut}
          />

          {/* Cart Summary */}
          <CartSummary
            subtotal={calculateGrandTotal()}
            shippingCost={shippingCost}
            total={calculateTotalWithShipping()}
            isCheckingOut={isCheckingOut}
            onCheckout={handleCheckout}
            isCheckoutDisabled={isCheckoutDisabled}
            isMobile={isMobileSm}
            shippingAddress={shippingAddress}
          />
        </div>
      </div>
    </div>
  );
}
