"use client";

import { useTranslation } from "@/components/Context/TranslationContext";
import PostOtherIcons from "@/components/Post/Post/Icons/PostOtherIcons";
import StoreItemCardContent from "@/components/ui/shared/StoreItemCardContent/StoreItemCardContent";
import { useAuctionTimer } from "@/lib/hooks/useAuctionTimer";
import { formatPrice } from "@/lib/utils/formatPrice";
import { Clock, Gavel, Trophy, Users } from "lucide-react";

export default function StoreAuctionItemCard({
  item,
  mongoUser,
  isOwner,
  isAdmin,
}) {
  const { t } = useTranslation();
  const { formattedTimeLeft, auctionStatus, statusInfo, isActive, isEnded } =
    useAuctionTimer(item);

  // Prepare files for carousel
  const carouselFiles =
    item.files?.map((file) => ({
      fileUrl: file.fileUrl,
      fileType: file.fileType,
      fileName: file.fileName || "",
      _id: file._id,
    })) || [];

  // Prepare content for display
  const content = {
    title: item.title,
    text: item.text,
    category: item.category,
    storeItem: item, // Pass the full store item for auction functionality
    type: "auction", // Indicate this is an auction item
  };

  const sizeFixClass = "maw575 !wf !mah575 !hf min-[600px]:miw575";
  const currentBid = item.auctionCurrentBid?.amount || 0;
  const startPrice = item.auctionStartPrice || 0;
  const bidCount = item.auctionBids?.length || 0;

  const renderAuctionTimer = () => {
    if (!formattedTimeLeft && !isEnded) return null;

    return (
      <div className="poa t10 l10 z-20">
        <div
          className={`px8 py4 rounded-lg text-xs font-medium border ${statusInfo.color} ${statusInfo.bgColor} ${statusInfo.borderColor}`}
        >
          <div className="f aic g5">
            <Clock size={12} />
            <span>
              {isEnded
                ? t("auctionEnded")
                : `${statusInfo.label} ${formattedTimeLeft?.formatted || ""}`}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderAuctionStatus = () => {
    return (
      <div className="poa t10 r10 z-20">
        <div
          className={`px8 py4 rounded-lg text-xs font-medium border ${
            isActive
              ? "text-green-600 bg-green-50 border-green-200"
              : isEnded
              ? "text-red-600 bg-red-50 border-red-200"
              : "text-amber-600 bg-amber-50 border-amber-200"
          }`}
        >
          <div className="f aic g5">
            <Gavel size={12} />
            <span className="uppercase">
              {isActive ? t("live") : isEnded ? t("ended") : t("upcoming")}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderWinnerBadge = () => {
    if (!isEnded || !item.auctionWinnerId) return null;

    const isCurrentUserWinner = item.auctionWinnerId === mongoUser?._id;

    return (
      <div className="poa b10 l10 z-20">
        <div
          className={`px8 py4 rounded-lg text-xs font-medium border ${
            isCurrentUserWinner
              ? "text-emerald-600 bg-emerald-50 border-emerald-200"
              : "text-purple-600 bg-purple-50 border-purple-200"
          }`}
        >
          <div className="f aic g5">
            <Trophy size={12} />
            <span>{isCurrentUserWinner ? t("youWon") : t("sold")}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`${sizeFixClass} bg-background border rounded-lg overflow-hidden hover:shadow-md transition-shadow por`}
    >
      {/* PostOtherIcons for update/delete functionality */}
      {isOwner && (
        <PostOtherIcons
          col={{ name: "storeitems" }}
          post={item}
          postsPaginationType="infinite"
          isAdmin={isAdmin}
          isOwner={isOwner}
          showAdminIcons={true}
          mongoUser={mongoUser}
        />
      )}

      {/* Auction timer and status badges overlaid on the carousel */}
      {renderAuctionTimer()}
      {renderAuctionStatus()}
      {renderWinnerBadge()}

      {/* StoreItemCardContent with proper auction overlay handling */}
      <StoreItemCardContent
        files={carouselFiles}
        content={content}
        className="w-full"
        aspectRatio="aspect-square"
        showThumbnails={false}
        showIndicators={false}
        showArrows={carouselFiles.length > 1}
        imageClassName="w-full h-full object-cover"
        mongoUser={mongoUser}
        // Let StoreItemCardContent handle the auction overlay properly
        // Remove customOverlay to allow proper auction content overlay
        customContent={
          <div className="p15 bg-background">
            {/* Title and Category */}
            <div className="mb10">
              <h3 className="font-semibold text-lg mb5 line-clamp-1">
                {item.title}
              </h3>
              {item.category && (
                <p className="text-sm text-muted-foreground uppercase tracking-wide">
                  {item.category}
                </p>
              )}
            </div>

            {/* Current Bid Info */}
            <div className="fc g8 mb10">
              <div className="f jcsb aic">
                <span className="text-sm text-muted-foreground">
                  {currentBid > 0 ? t("currentBid") : t("startingBid")}
                </span>
                <span className="text-lg font-bold text-foreground">
                  {formatPrice(Math.max(currentBid, startPrice))}
                </span>
              </div>

              {/* Bid count */}
              <div className="f aic g5 text-sm text-muted-foreground">
                <Users size={12} />
                <span>
                  {bidCount} {bidCount === 1 ? t("bid") : t("bids")}
                </span>
              </div>
            </div>

            {/* Time remaining */}
            {formattedTimeLeft && !isEnded && (
              <div className="f aic g5 text-sm">
                <Clock size={12} className={statusInfo.color} />
                <span className={statusInfo.color}>
                  {statusInfo.label} {formattedTimeLeft.formatted}
                </span>
              </div>
            )}

            {/* Auction ended message */}
            {isEnded && (
              <div className="text-sm text-red-600 font-medium">
                <div className="f aic g5">
                  <Clock size={12} />
                  <span>{t("auctionEnded")}</span>
                </div>
                {item.auctionWinnerId && (
                  <div className="f aic g5 mt5">
                    <Trophy size={12} />
                    <span>
                      {item.auctionWinnerId === mongoUser?._id
                        ? t("youWonThisAuction")
                        : t("auctionSold")}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        }
      />
    </div>
  );
}
