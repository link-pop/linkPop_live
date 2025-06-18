"use client";

import { useTranslation } from "@/components/Context/TranslationContext";
import { useAuctionTimer } from "@/lib/hooks/useAuctionTimer";
import { Clock, Gavel, Trophy } from "lucide-react";

export default function AuctionTimer({
  auctionItem,
  mongoUser,
  variant = "default", // "default", "badge", "inline"
  className = "",
  showStatus = true,
  showWinner = true,
}) {
  const { t } = useTranslation();
  const { formattedTimeLeft, statusInfo, isActive, isEnded } =
    useAuctionTimer(auctionItem);

  if (!auctionItem) return null;

  const isCurrentUserWinner = auctionItem.auctionWinnerId === mongoUser?._id;

  // Badge variant (for overlays on images)
  if (variant === "badge") {
    return (
      <div className={`${className}`}>
        {/* Timer Badge */}
        {(formattedTimeLeft || isEnded) && (
          <div className="poa t10 l10 z-20">
            <div
              className={`px8 py4 rounded-lg text-xs font-medium border ${statusInfo.color} ${statusInfo.bgColor} ${statusInfo.borderColor}`}
            >
              <div className="f aic g5">
                <Clock size={12} />
                <span>
                  {isEnded
                    ? t("auctionEnded")
                    : `${statusInfo.label} ${
                        formattedTimeLeft?.formatted || ""
                      }`}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Status Badge */}
        {showStatus && (
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
        )}

        {/* Winner Badge */}
        {showWinner && isEnded && auctionItem.auctionWinnerId && (
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
        )}
      </div>
    );
  }

  // Inline variant (for content sections)
  if (variant === "inline") {
    return (
      <div className={`fc g5 ${className}`}>
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
            {auctionItem.auctionWinnerId && (
              <div className="f aic g5 mt5">
                <Trophy size={12} />
                <span>
                  {isCurrentUserWinner
                    ? t("youWonThisAuction")
                    : t("auctionSold")}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={`f aic g8 text-sm ${className}`}>
      <Clock size={14} className={statusInfo.color} />
      <span className={statusInfo.color + " font-medium"}>
        {isEnded
          ? t("auctionEnded")
          : `${statusInfo.label} ${formattedTimeLeft?.formatted || ""}`}
      </span>
      {isEnded && isCurrentUserWinner && (
        <div className="f aic g5 ml10 text-emerald-600">
          <Trophy size={14} />
          <span>{t("youWon")}</span>
        </div>
      )}
    </div>
  );
}
