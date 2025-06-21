import { useState } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";
import { useContext } from "@/components/Context/Context";

export function useAuctionBuyNowShipping() {
  const { t } = useTranslation();
  const { toastSet } = useContext();

  const [showShippingForm, setShowShippingForm] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  const handleBuyNowClick = ({
    isLoggedIn,
    isOwner,
    buyNowPrice,
    auctionItem,
  }) => {
    if (!isLoggedIn) {
      toastSet({
        isOpen: true,
        title: t("loginRequired"),
        text: t("pleaseLoginToBuyNow"),
      });
      return;
    }

    if (isOwner) {
      toastSet({
        isOpen: true,
        title: t("cannotBuyOwnItem"),
        text: t("cannotBuyOwnItemDescription"),
      });
      return;
    }

    // Validate buy now price vs current bid before proceeding to payment
    const currentBid = auctionItem?.auctionCurrentBid?.amount || 0;
    const startPrice = auctionItem?.auctionStartPrice || 0;
    const highestPrice = Math.max(currentBid, startPrice);

    if (buyNowPrice <= highestPrice) {
      toastSet({
        isOpen: true,
        title: t("buyNowPriceTooLow"),
        text: t("buyNowPriceMustBeHigherThanCurrentBid"),
      });
      return;
    }

    // Show shipping form
    setShowShippingForm(true);
  };

  const handleBuyNowWithShipping = async ({ auctionItemId, shippingData }) => {
    setIsBuyingNow(true);

    try {
      // Create Stripe checkout session for auction buy-now with shipping
      const response = await fetch("/api/stripe/auction-buy-now", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          auctionItemId: auctionItemId,
          shippingAddress: shippingData.shippingAddress,
          shippingCost: shippingData.shippingCost,
          selectedShippingRate: shippingData.selectedShippingRate,
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
      console.error("❌ Error creating buy now checkout:", error);
      toastSet({
        isOpen: true,
        title: t("paymentError"),
        text: error.message || t("somethingWentWrong"),
      });
      setIsBuyingNow(false);
    }
    // Note: Don't set isBuyingNow to false here since user is being redirected
  };

  const handleBackFromShipping = () => {
    setShowShippingForm(false);
  };

  return {
    showShippingForm,
    isBuyingNow,
    handleBuyNowClick,
    handleBuyNowWithShipping,
    handleBackFromShipping,
  };
}
