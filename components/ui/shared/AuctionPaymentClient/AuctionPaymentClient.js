"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "@/components/Context/TranslationContext";
import { useContext } from "@/components/Context/Context";
import { getOne } from "@/lib/actions/crud";
import { checkAuctionPaymentStatus } from "@/lib/actions/auctionActions";
import PostsLoader from "@/components/Post/Posts/PostsLoader";
import {
  CheckCircle,
  CreditCard,
  Clock,
  Package,
  Lock,
  MapPin,
} from "lucide-react";
import CreatedBy from "@/components/Post/Post/CreatedBy";
import Link from "next/link";
import Button2 from "@/components/ui/shared/Button/Button2";
import StoreAuctionItemCard from "@/components/Post/Post/Full/Custom/StoreAuctionItemCard";
import CartShippingAddressForm from "@/components/ui/shared/Cart/CartShippingAddressForm";
import { formatPrice } from "@/lib/utils/formatPrice";

export default function AuctionPaymentClient({ mongoUser }) {
  const { t } = useTranslation();
  const { toastSet } = useContext();
  const { auctionId } = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [auctionItem, setAuctionItem] = useState(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [shippingAddress, setShippingAddress] = useState(null);
  const [shippingCost, setShippingCost] = useState(0);
  const [selectedShippingRate, setSelectedShippingRate] = useState(null);
  const [showShippingForm, setShowShippingForm] = useState(false);

  useEffect(() => {
    const loadAuction = async () => {
      try {
        // Get auction item - validation will happen server-side during payment
        const auction = await getOne({
          col: "storeitems",
          data: { _id: auctionId },
          populate: [
            {
              path: "files",
            },
            "createdBy",
          ],
        });

        if (!auction) {
          setError("Auction not found");
          setIsLoading(false);
          return;
        }

        setAuctionItem(auction);

        // Check if payment has already been completed
        const paymentCheck = await checkAuctionPaymentStatus({
          auctionItemId: auctionId,
        });

        if (paymentCheck.error) {
          console.error("Payment status check error:", paymentCheck.error);
          setError(paymentCheck.error);
          setIsLoading(false);
          return;
        }

        setPaymentStatus(paymentCheck);
        setIsLoading(false);

        // Show shipping form if payment is not completed
        if (!paymentCheck.isPaid) {
          setShowShippingForm(true);
        }
      } catch (error) {
        console.error("Error loading auction:", error);
        setError(
          "Failed to load auction details. The server will validate your access when you attempt payment."
        );
        setIsLoading(false);
      }
    };

    if (auctionId && mongoUser?._id) {
      loadAuction();
    }
  }, [auctionId, mongoUser?._id]);

  const handlePayNow = async () => {
    if (isRedirecting || !auctionItem || paymentStatus?.isPaid) return;

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

    setIsRedirecting(true);

    try {
      // Create Stripe checkout session for auction winner payment with shipping
      const response = await fetch("/api/stripe/auction-winner-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          auctionItemId: auctionItem._id,
          shippingAddress,
          shippingCost,
          selectedShippingRate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create payment session");
      }

      if (data.sessionUrl) {
        // Redirect to Stripe checkout
        window.location.href = data.sessionUrl;
      } else {
        throw new Error("No payment URL received");
      }
    } catch (error) {
      console.error("❌ Error creating payment session:", error);
      setIsRedirecting(false);

      toastSet({
        isOpen: true,
        title: t("paymentFailed"),
        text: error.message || t("unexpectedError"),
      });
    }
  };

  if (!mongoUser?._id) {
    return (
      <div className="fcc min-h-screen p20">
        <div className="text-center">
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
        <div className="text-center max-w-md">
          <div className="w20 h20 bg-red-100 rounded-full fcc mx-auto mb15">
            <span className="text-red-600 text-xl">⚠️</span>
          </div>
          <h1 className="text-xl font-bold mb10">Payment Error</h1>
          <p className="text-muted-foreground mb20">{error}</p>
          <button
            onClick={() => router.back()}
            className="px20 py10 bg-accent hover:bg-accent/80 text-accent-foreground rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!auctionItem) {
    return null;
  }

  const winningAmount = auctionItem.auctionCurrentBid?.amount || 0;
  const totalWithShipping = winningAmount + shippingCost;

  // Create cart groups format for shipping calculation
  const cartGroups = [
    {
      storeOwner: auctionItem.createdBy,
      items: [
        {
          _id: auctionItem._id,
          storeItemId: auctionItem,
          quantity: 1,
        },
      ],
      totalItems: 1,
      subtotal: winningAmount,
    },
  ];

  // If payment is already completed, show success message with auction card
  if (paymentStatus?.isPaid) {
    return (
      <div className="max-w-4xl mx-auto p20">
        {/* Success Header */}
        <div className="text-center mb30">
          <Package className="w60 h60 text-green-600 mx-auto mb15" />
          <h1 className="text-3xl font-bold mb10">{t("paymentCompleted")}</h1>
          <p className="text-muted-foreground mb10">
            {t("thankYouForPurchase")}
          </p>
          <div className="text-2xl font-bold text-green-600">
            {t("paidAmount")}: {formatPrice(winningAmount)}
          </div>
        </div>

        {/* Full Auction Item Card */}
        <div className="mb30 fcc">
          <StoreAuctionItemCard
            item={auctionItem}
            mongoUser={mongoUser}
            isOwner={false}
            isAdmin={false}
          />
        </div>

        {/* Order Status */}
        <div className="bg-background border rounded-lg p20 mb20 text-center">
          <h3 className="text-lg font-semibold mb10">{t("orderStatus")}</h3>
          <div className="f aic jcc g10 mb10">
            <CheckCircle className="w20 h20 text-green-600" />
            <span className="font-bold text-green-600">{t("paid")}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {t("orderProcessingMessage")}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="f g10 max-w-md mx-auto">
          <Link
            href="/orders"
            className="flex-1 px20 py15 bg-accent hover:bg-accent/80 text-accent-foreground rounded-lg transition-colors f aic jcc g10 font-medium"
          >
            <Package className="w20 h20" />
            {t("viewOrders")}
          </Link>
          <button
            onClick={() => router.back()}
            className="flex-1 px20 py10 border border-border hover:bg-muted text-center rounded-lg transition-colors"
          >
            {t("goBack")}
          </button>
        </div>
      </div>
    );
  }

  // Payment pending - show auction card with shipping form and payment button
  return (
    <div className="max-w-6xl mx-auto p20">
      {/* Success Header */}
      <div className="text-center mb30">
        <CheckCircle className="w60 h60 text-green-600 mx-auto mb15" />
        <h1 className="text-3xl font-bold mb10">{t("congratulations")}</h1>
        <p className="text-muted-foreground mb10">{t("youWonThisAuction")}</p>
        <div className="text-2xl font-bold text-foreground">
          {t("winningBid")}: {formatPrice(winningAmount)}
        </div>
      </div>

      {/* Main Content - Desktop: Side by side, Mobile: Stacked */}
      <div className="fcc">
        {/* Left Side: Auction Item Card */}
        <div className="asfs maw600 wf">
          <StoreAuctionItemCard
            item={auctionItem}
            mongoUser={mongoUser}
            isOwner={false}
            isAdmin={false}
          />
        </div>

        {/* Right Side: Shipping & Payment */}
        <div className="maw400 wf fc g20">
          {/* Shipping Address Form */}
          {showShippingForm && (
            <CartShippingAddressForm
              onShippingAddressChange={setShippingAddress}
              onShippingCostChange={setShippingCost}
              onShippingRateChange={setSelectedShippingRate}
              cartGroups={cartGroups}
              isLoading={isRedirecting}
            />
          )}

          {/* Payment Summary */}
          <div className="bg-background border border-border rounded-xl p25 shadow-sm">
            <div className="f aic g10 mb20">
              <CreditCard className="w20 h20 text-foreground/50" />
              <h3 className="text-lg font-semibold text-foreground">
                {t("paymentSummary")}
              </h3>
            </div>

            <div className="fc g10 mb20">
              <div className="f jcsb">
                <span className="text-muted-foreground">
                  {t("winningBid")}:
                </span>
                <span className="font-medium">
                  {formatPrice(winningAmount)}
                </span>
              </div>
              {shippingCost > 0 && (
                <div className="f jcsb">
                  <span className="text-muted-foreground">
                    {t("shipping")}:
                  </span>
                  <span className="font-medium">
                    {formatPrice(shippingCost)}
                  </span>
                </div>
              )}
              <div className="f jcsb pt10 border-t border-border">
                <span className="font-semibold text-foreground">
                  {t("total")}:
                </span>
                <span className="font-bold text-lg">
                  {formatPrice(totalWithShipping)}
                </span>
              </div>
            </div>

            {/* Payment Button */}
            {isRedirecting ? (
              <div className="fc g15 text-center">
                <div className="f aic jcc g10">
                  <PostsLoader isLoading className="w20 h20" />
                </div>
              </div>
            ) : (
              <div className="fc g15">
                <Button2
                  onClick={handlePayNow}
                  disabled={
                    isRedirecting || !shippingAddress || shippingCost <= 0
                  }
                  className="w-full"
                >
                  {t("payNow")} - {formatPrice(totalWithShipping)}
                </Button2>
                <p className="text-sm text-muted-foreground text-center">
                  {t("completePaymentToClaim")}
                </p>
              </div>
            )}

            {/* Security Note */}
            <p className="fcc g3 text-xs text-muted-foreground mt15">
              <Lock className="w15 h15" /> {t("securePaymentByStripe")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
