"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";
import { useContext } from "@/components/Context/Context";
import { formatPrice } from "@/lib/utils/formatPrice";
import { useAuctionTimer } from "@/lib/hooks/useAuctionTimer";
import { useAuctionItem } from "@/lib/hooks/useAuctionItem";
import { placeBid, buyNow } from "@/lib/actions/auctionActions";
import CreatedBy from "@/components/Post/Post/CreatedBy";
import RichTextContent from "@/components/ui/shared/RichTextContent/RichTextContent";
import {
  Clock,
  Gavel,
  Trophy,
  Users,
  TrendingUp,
  ShoppingCart,
  AlertCircle,
  DollarSign,
} from "lucide-react";

export default function StoreItemAuctionContentOverlay({
  content,
  mongoUser,
  variant = "default", // "default" | "fullscreen"
  className = "",
}) {
  const { t } = useTranslation();
  const { toastSet } = useContext();
  const initialAuctionItem = content?.storeItem;

  // Use the auction item hook for real-time updates
  const {
    auctionItem,
    isLoading: isLoadingAuctionData,
    updateAuctionAfterBid,
    updateAuctionAfterBuyNow,
    refreshAuctionData,
    invalidateRelatedQueries,
  } = useAuctionItem(initialAuctionItem?._id, initialAuctionItem);

  const [bidAmount, setBidAmount] = useState("");
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  const {
    formattedTimeLeft,
    auctionStatus,
    statusInfo,
    isActive,
    isEnded,
    hasStarted,
  } = useAuctionTimer(auctionItem);

  const isOwner = auctionItem?.createdBy?._id === mongoUser?._id;
  const isLoggedIn = Boolean(mongoUser?._id);
  const currentBid = auctionItem?.auctionCurrentBid?.amount || 0;
  const startPrice = auctionItem?.auctionStartPrice || 0;
  const minBidIncrement = auctionItem?.auctionMinBidIncrement || 1;
  const buyNowPrice = auctionItem?.auctionBuyNowPrice;
  const reservePrice = auctionItem?.auctionReservePrice;
  const bidCount = auctionItem?.auctionBids?.length || 0;
  const isCurrentUserHighestBidder =
    auctionItem?.auctionCurrentBid?.bidderId === mongoUser?._id;
  const isWinner = auctionItem?.auctionWinnerId === mongoUser?._id;

  // Calculate minimum next bid
  const minNextBid = Math.max(currentBid, startPrice) + minBidIncrement;

  // Check if buy now is valid (price must be higher than current highest price)
  const highestPrice = Math.max(currentBid, startPrice);
  const isBuyNowValid = buyNowPrice && buyNowPrice > highestPrice;

  // Set default bid amount when component mounts or auction data updates
  useEffect(() => {
    if (isActive && !bidAmount) {
      setBidAmount(minNextBid.toFixed(2));
    }
  }, [isActive, minNextBid, bidAmount]);

  const handlePlaceBid = async () => {
    if (!isLoggedIn) {
      toastSet({
        isOpen: true,
        title: t("loginRequired"),
        text: t("pleaseLoginToBid"),
      });
      return;
    }

    if (isOwner) {
      toastSet({
        isOpen: true,
        title: t("cannotBidOnOwnItem"),
        text: t("cannotBidOnOwnItemDescription"),
      });
      return;
    }

    const bid = parseFloat(bidAmount);
    if (isNaN(bid) || bid < minNextBid) {
      toastSet({
        isOpen: true,
        title: t("invalidBidAmount"),
        text: t("bidMustBeAtLeast") + " " + formatPrice(minNextBid),
      });
      return;
    }

    setIsPlacingBid(true);

    try {
      // Optimistically update the UI first
      updateAuctionAfterBid({
        amount: bid,
        bidderId: mongoUser._id,
        bidTime: new Date(),
      });

      // Update bid amount for next bid immediately
      setBidAmount((bid + minBidIncrement).toFixed(2));

      const result = await placeBid({
        auctionItemId: auctionItem._id,
        bidAmount: bid,
      });

      if (result.error) {
        // Revert optimistic update on error
        await refreshAuctionData();

        toastSet({
          isOpen: true,
          title: t("bidFailed"),
          text: result.error,
        });
        return;
      }

      toastSet({
        isOpen: true,
        title: t("bidPlaced"),
        text: t("bidPlacedSuccessfully"),
      });

      // Refresh auction data to get the latest state
      await refreshAuctionData();
      invalidateRelatedQueries();
    } catch (error) {
      console.error("❌ Error placing bid:", error);

      // Revert optimistic update on error
      await refreshAuctionData();

      toastSet({
        isOpen: true,
        title: t("bidFailed"),
        text: error.message || t("unexpectedError"),
      });
    } finally {
      setIsPlacingBid(false);
    }
  };

  const handleBuyNow = async () => {
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

    setIsBuyingNow(true);

    try {
      // Create Stripe checkout session for auction buy-now
      const response = await fetch("/api/stripe/auction-buy-now", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          auctionItemId: auctionItem._id,
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
        title: t("buyNowFailed"),
        text: error.message || t("unexpectedError"),
      });
      setIsBuyingNow(false);
    }
    // Note: Don't set isBuyingNow to false here since user is being redirected
  };

  const renderAuctionHeader = () => (
    <div className="p20 border-b border-border">
      <div className="f jcsb aic mb10">
        <h2 className="text-xl font-bold">{content.title}</h2>
        <div
          className={`px10 py5 rounded-lg text-sm font-medium border ${statusInfo.color} ${statusInfo.bgColor} ${statusInfo.borderColor}`}
        >
          <div className="f aic g5">
            <Gavel size={14} />
            <span className="uppercase">
              {isActive ? t("live") : isEnded ? t("ended") : t("upcoming")}
            </span>
          </div>
        </div>
      </div>

      {content.category && (
        <p className="text-sm text-muted-foreground uppercase tracking-wide mb10">
          {content.category}
        </p>
      )}

      {/* Seller info */}
      <div className="f aic g10">
        <span className="text-sm text-muted-foreground">{t("seller")}:</span>
        <CreatedBy
          createdBy={auctionItem.createdBy}
          showName={true}
          className="text-sm"
        />
      </div>
    </div>
  );

  const renderCurrentBidInfo = () => (
    <div className="p20 border-b border-border bg-accent/5">
      <div className="f jcsb aic mb15">
        <div>
          <h3 className="text-lg font-semibold mb5">
            {currentBid > 0 ? t("currentBid") : t("startingBid")}
          </h3>
          <div className="text-2xl font-bold text-foreground">
            {formatPrice(Math.max(currentBid, startPrice))}
          </div>
        </div>
        <div className="text-right">
          <div className="f aic g5 text-sm text-muted-foreground mb5">
            <Users size={12} />
            <span>
              {bidCount} {bidCount === 1 ? t("bid") : t("bids")}
            </span>
          </div>
          {isCurrentUserHighestBidder && (
            <div className="f aic g5 text-sm text-green-600 font-medium">
              <Trophy size={12} />
              <span>{t("youAreWinning")}</span>
            </div>
          )}
        </div>
      </div>

      {/* Time remaining */}
      {formattedTimeLeft && !isEnded && (
        <div className="f aic g8 text-sm">
          <Clock size={14} className={statusInfo.color} />
          <span className={statusInfo.color + " font-medium"}>
            {statusInfo.label} {formattedTimeLeft.formatted}
          </span>
        </div>
      )}

      {/* Auction ended */}
      {isEnded && (
        <div className="f aic g8 text-sm text-red-600 font-medium">
          <Clock size={14} />
          <span>{t("auctionEnded")}</span>
          {isWinner && (
            <div className="f aic g5 ml10 text-emerald-600">
              <Trophy size={14} />
              <span>{t("youWon")}</span>
            </div>
          )}
        </div>
      )}

      {/* Progress bar showing bid progress towards reserve price */}
      {reservePrice && (
        <div className="mt10">
          <div className="f jcsb text-xs text-muted-foreground mb5">
            <span>
              {t("currentBid")}: {formatPrice(Math.max(currentBid, startPrice))}
            </span>
            <span>
              {t("reservePrice")}: {formatPrice(reservePrice)}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                Math.max(currentBid, startPrice) >= reservePrice
                  ? "bg-green-500"
                  : "bg-amber-500"
              }`}
              style={{
                width: `${Math.min(
                  100,
                  (Math.max(currentBid, startPrice) / reservePrice) * 100
                )}%`,
              }}
            />
          </div>
          <div className="text-xs text-muted-foreground mt5">
            {Math.max(currentBid, startPrice) >= reservePrice
              ? t("reservePriceMet")
              : t("progressToReserve")}
          </div>
        </div>
      )}
    </div>
  );

  const renderBiddingSection = () => {
    if (isEnded || !isActive) return null;

    return (
      <div className="p20 border-b border-border">
        <h4 className="font-semibold mb15">{t("placeBid")}</h4>

        <div className="fc g15">
          {/* Bid amount input */}
          <div className="f g10">
            <div className="flex-1">
              <label className="text-sm text-muted-foreground mb5 block">
                {t("bidAmount")}
              </label>
              <div className="por">
                <DollarSign
                  size={16}
                  className="poa l10 t50 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="number"
                  min={minNextBid}
                  step="0.01"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="w-full pl30 pr10 py8 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder={minNextBid.toFixed(2)}
                  disabled={!isLoggedIn || isOwner}
                />
              </div>
              <p className="text-xs text-muted-foreground mt5">
                {t("minimumBid")}: {formatPrice(minNextBid)}
              </p>
            </div>

            <button
              onClick={handlePlaceBid}
              disabled={
                !isLoggedIn ||
                isOwner ||
                isPlacingBid ||
                parseFloat(bidAmount) < minNextBid
              }
              className={`px15 py8 bg-accent hover:bg-accent/80 text-accent-foreground rounded-md font-medium transition-colors f aic g8 ${
                !isLoggedIn || isOwner || isPlacingBid
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              <Gavel size={16} />
              {isPlacingBid ? t("placingBid") : t("placeBid")}
            </button>
          </div>

          {/* Buy now option */}
          {buyNowPrice && (
            <div className="pt15 border-t border-border">
              <div className="f jcsb aic">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("buyNowPrice")}
                  </p>
                  <p className="text-lg font-bold">
                    {formatPrice(buyNowPrice)}
                  </p>
                  {!isBuyNowValid && (
                    <p className="text-xs text-red-500 mt5">
                      {t("buyNowPriceMustBeHigherThanCurrentBid")}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleBuyNow}
                  disabled={
                    !isLoggedIn || isOwner || isBuyingNow || !isBuyNowValid
                  }
                  className={`px15 py8 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors f aic g8 ${
                    !isLoggedIn || isOwner || isBuyingNow || !isBuyNowValid
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <ShoppingCart size={16} />
                  {isBuyingNow ? t("purchasing") : t("buyNow")}
                </button>
              </div>
            </div>
          )}

          {/* Login prompt */}
          {!isLoggedIn && (
            <div className="p10 bg-muted/50 border border-border rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                {t("pleaseLoginToBid")}
              </p>
            </div>
          )}

          {/* Owner message */}
          {isOwner && (
            <div className="p10 bg-accent/10 border border-accent/20 rounded-lg">
              <p className="text-sm text-foreground text-center">
                {t("cannotBidOnOwnItem")}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderDescription = () => {
    if (!content.text) return null;

    return (
      <div className="p20">
        <h4 className="font-semibold mb10">{t("description")}</h4>
        <RichTextContent content={content.text} />
      </div>
    );
  };

  // Show loading state if auction data is loading
  if (isLoadingAuctionData && !auctionItem) {
    return (
      <div className="fcc p20">
        <div className="f aic g10 text-muted-foreground">
          <Clock size={16} className="animate-pulse" />
          <span>{t("loadingAuction")}</span>
        </div>
      </div>
    );
  }

  // Default overlay for card/carousel view - NO BIDDING FUNCTIONALITY
  // Bidding functionality is ONLY available in "fullscreen" variant
  if (variant === "default") {
    return (
      <div
        className={`poa t0 bg-background/50 f jcsb wf px10 py5 ${className}`}
      >
        {/* Title and current bid */}
        {content.title && (
          <h3 className="text-lg fw500 text-foreground/80 line-clamp-1">
            {content.title}
          </h3>
        )}

        <div className="text-right">
          <div className="text-lg fw500 text-foreground/80">
            {formatPrice(Math.max(currentBid, startPrice))}
          </div>
          {/* Show timer for active auctions */}
          {formattedTimeLeft && !isEnded && (
            <div className="text-xs text-foreground/70">
              {statusInfo.label} {formattedTimeLeft.formatted}
            </div>
          )}
          {isEnded && (
            <div className="text-xs text-red-600">{t("auctionEnded")}</div>
          )}
        </div>
      </div>
    );
  }

  const baseClasses =
    variant === "fullscreen"
      ? "poa r0 t0 h-full w-1/3 min-w-[400px] bg-background border-l border-border oa"
      : "wf";

  return (
    <div className={`${baseClasses} ${className}`}>
      <div className="h-full fc">
        {renderAuctionHeader()}
        {renderCurrentBidInfo()}
        {renderBiddingSection()}
        {renderDescription()}
      </div>
    </div>
  );
}
