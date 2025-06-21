"use client";

import { useState } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";
import { useContext } from "@/components/Context/Context";
import { formatPrice } from "@/lib/utils/formatPrice";
import CartShippingAddressForm from "@/components/ui/shared/Cart/CartShippingAddressForm";
import { ArrowLeft, ShoppingCart } from "lucide-react";

export default function AuctionBuyNowShippingForm({
  auctionItem,
  content,
  buyNowPrice,
  onBack,
  onProceedToPayment,
  isBuyingNow = false,
}) {
  const { t } = useTranslation();
  const { toastSet } = useContext();
  const [shippingAddress, setShippingAddress] = useState(null);
  const [shippingCost, setShippingCost] = useState(0);
  const [selectedShippingRate, setSelectedShippingRate] = useState(null);

  // Create a mock cart group for the auction item
  const mockCartGroups = [
    {
      storeOwner: auctionItem.createdBy,
      items: [
        {
          _id: "temp-auction-item",
          storeItemId: {
            _id: auctionItem._id,
            title: content.title,
            price: buyNowPrice,
            files: auctionItem.files || [],
          },
          quantity: 1,
        },
      ],
      totalItems: 1,
      subtotal: buyNowPrice,
    },
  ];

  const handleProceedToPayment = () => {
    // Validate shipping information
    if (!shippingAddress) {
      toastSet({
        isOpen: true,
        title: t("shippingAddressRequired"),
        text: t("pleaseProvideShippingAddress"),
      });
      return;
    }

    if (shippingCost <= 0) {
      toastSet({
        isOpen: true,
        title: t("shippingCostRequired"),
        text: t("pleaseCalculateShippingCost"),
      });
      return;
    }

    onProceedToPayment({
      shippingAddress,
      shippingCost,
      selectedShippingRate,
    });
  };

  return (
    <div className="h-full fc">
      {/* Header with back button */}
      <div className="p20 border-b border-border">
        <div className="f aic g10 mb10">
          <button
            onClick={onBack}
            className="f aic jcc w32 h32 rounded-full hover:bg-muted/50 transition-colors"
            disabled={isBuyingNow}
          >
            <ArrowLeft size={18} />
          </button>
          <h2 className="text-xl font-bold">{t("shippingInformation")}</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {t("provideShippingDetailsForAuction")}
        </p>
      </div>

      {/* Auction item summary */}
      <div className="p20 border-b border-border bg-accent/5">
        <h3 className="font-semibold mb10">{t("itemSummary")}</h3>
        <div className="f jcsb aic">
          <div>
            <p className="font-medium">{content.title}</p>
            <p className="text-sm text-muted-foreground">{t("buyNowPrice")}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold">{formatPrice(buyNowPrice)}</p>
            {shippingCost > 0 && (
              <p className="text-sm text-muted-foreground">
                + {formatPrice(shippingCost)} {t("shipping")}
              </p>
            )}
          </div>
        </div>
        {shippingCost > 0 && (
          <div className="mt10 pt10 border-t border-border">
            <div className="f jcsb aic font-semibold">
              <span>{t("total")}:</span>
              <span>{formatPrice(buyNowPrice + shippingCost)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Shipping form */}
      <div className="flex-1 oa p20">
        <CartShippingAddressForm
          onShippingAddressChange={setShippingAddress}
          onShippingCostChange={setShippingCost}
          onShippingRateChange={setSelectedShippingRate}
          cartGroups={mockCartGroups}
          isLoading={isBuyingNow}
        />
      </div>

      {/* Buy now button with shipping */}
      <div className="p20 border-t border-border">
        <button
          onClick={handleProceedToPayment}
          disabled={!shippingAddress || shippingCost <= 0 || isBuyingNow}
          className={`w-full px20 py12 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors f aic jcc g8 ${
            !shippingAddress || shippingCost <= 0 || isBuyingNow
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
        >
          <ShoppingCart size={18} />
          {isBuyingNow
            ? t("purchasing")
            : `${t("buyNow")} - ${formatPrice(buyNowPrice + shippingCost)}`}
        </button>
        {(!shippingAddress || shippingCost <= 0) && (
          <p className="text-sm text-muted-foreground text-center mt10">
            {!shippingAddress
              ? t("pleaseCompleteShippingAddress")
              : t("pleaseCalculateShippingCost")}
          </p>
        )}
      </div>
    </div>
  );
}
