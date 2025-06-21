"use client";

import { useNotification } from "@/components/Context/NotificationContext";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Post from "../Post";
import CreatedBy from "../CreatedBy";
import getNotificationIcon from "@/components/Context/getNotificationIcon";
import removeHtmlFromText from "@/lib/utils/removeHtmlFromText";
import { useTranslation } from "@/components/Context/TranslationContext";
import AuctionPaymentCountdown from "@/components/ui/shared/AuctionPaymentCountdown/AuctionPaymentCountdown";
import { Trophy, Gavel, Clock, DollarSign } from "lucide-react";

export default function NotificationAuctionPost(props) {
  const {
    post: notification,
    showCreatedAtTimeAgo = true,
    showNotificationUnread = true,
    className = "",
    onClick,
    isOnNotificationsRoute = false,
  } = props;
  const { markAsRead } = useNotification();
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    // Mark as read when viewed
    if (!notification.read) {
      markAsRead(notification._id);
    }
  }, [notification, markAsRead]);

  const handleClick = (e) => {
    onClick?.(e);
  };

  const handleBuyWonItem = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Extract auction ID from the notification link or sourceId
    const auctionId =
      notification.sourceId || notification.link?.split("/").pop();
    if (auctionId) {
      router.push(`/auction-payment/${auctionId}`);
    }
  };

  // Check notification types
  const isAuctionWon = notification.type === "auction_won";
  const isAuctionSold = notification.type === "auction_sold";
  const isAuctionEnded = notification.type === "auction_ended";
  const isAuctionOutbid = notification.type === "auction_outbid";

  // Get payment status from server-side processed data
  const paymentStatus = notification.paymentStatus || {
    isPaid: false,
    loading: false,
    checked: false,
  };

  // Get appropriate icon for auction notification type
  const getAuctionIcon = () => {
    switch (notification.type) {
      case "auction_won":
        return <Trophy className="w16 h16 text-emerald-600" />;
      case "auction_sold":
        return <DollarSign className="w16 h16 text-green-600" />;
      case "auction_ended":
        return <Clock className="w16 h16 text-muted-foreground" />;
      case "auction_outbid":
        return <Gavel className="w16 h16 text-amber-600" />;
      default:
        return getNotificationIcon(notification.type);
    }
  };

  // Get appropriate display name for auction notifications
  const getDisplayName = () => {
    switch (notification.type) {
      case "auction_won":
        return t("auctionWon");
      case "auction_sold":
        return t("auctionSold");
      case "auction_ended":
        return t("auctionEnded");
      case "auction_outbid":
        return t("auctionOutbid");
      default:
        return t("auction");
    }
  };

  // Get appropriate link for auction notifications
  const getNotificationLink = () => {
    if (isAuctionWon && isOnNotificationsRoute) {
      return `/auction-payment/${notification.sourceId}`;
    }
    return (
      notification.link ||
      `/${notification.sourceModel || "storeitems"}/${notification.sourceId}`
    );
  };

  // Get appropriate styling for notification type
  const getNotificationStyling = () => {
    switch (notification.type) {
      case "auction_won":
        return "";
      case "auction_sold":
        return "";
      case "auction_ended":
        return "";
      case "auction_outbid":
        return "";
      default:
        return "";
    }
  };

  return (
    <Post
      {...props}
      onClick={handleClick}
      showIcons={false}
      noOtherIcons={true}
      showTags={false}
      showCreatedAt={false}
      showCreatedAtTimeAgo={showCreatedAtTimeAgo}
      useCard={false}
      showAutoGenMongoFields={false}
      showCreatedBy={false}
      className={`fui border-b ${getNotificationStyling()} ${className}`}
      iconsClassName="poa r20 -t2"
      top={
        <div className="">
          <CreatedBy
            icon={getAuctionIcon()}
            createdBy={notification.sourceUserId}
            displayName={getDisplayName()}
            className="wbba f fwn !g5 mr5"
            bottomClassName="-mt12 fsi fw300"
            bottom={
              <>
                <Link
                  href={getNotificationLink()}
                  className={`p10 f g10 mb10 ${
                    !notification.read ? "bg-accent/10" : ""
                  } hover:bg-accent/20 transition-colors rounded-lg`}
                >
                  <div className="por shrink-0">
                    {showNotificationUnread && !notification.read && (
                      <div className="poa t-1 r-1 w-2 h-2 rounded-full bg-red-500"></div>
                    )}
                  </div>

                  <div className="fc g5 wf">
                    <p className="text-sm text-muted-foreground">
                      {removeHtmlFromText(notification.content)}
                    </p>

                    {/* Auction Won - Show payment actions ONLY on notifications route */}
                    {isAuctionWon && isOnNotificationsRoute && (
                      <>
                        {!paymentStatus.checked ? null : paymentStatus.isPaid ? (
                          <div className="mt10 fw600 fz14 text-emerald-600 f aic g5">
                            <Trophy size={14} />
                            {t("purchased")}
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={handleBuyWonItem}
                              className="tal mt10 fw600 fz14 text-emerald-600 underline hover:no-underline transition-all f aic g5"
                            >
                              <DollarSign size={14} />
                              {t("buyWonItemNow")}
                            </button>

                            {/* Countdown Timer */}
                            <AuctionPaymentCountdown
                              notificationCreatedAt={notification.createdAt}
                            />
                          </>
                        )}
                      </>
                    )}

                    {/* Auction Sold - Show celebration message */}
                    {isAuctionSold && (
                      <div className="f fwn mt10 fw600 fz14 text-green-600 f aic g5">
                        <DollarSign size={14} />
                        {t("congratulationsOnSale")}
                      </div>
                    )}

                    {/* Auction Ended - Show status */}
                    {isAuctionEnded && (
                      <div className="mt10 fw600 fz14 text-muted-foreground f aic g5">
                        <Clock size={14} />
                        {t("auctionHasEnded")}
                      </div>
                    )}

                    {/* Auction Outbid - Show encouragement */}
                    {isAuctionOutbid && (
                      <div className="mt10 fw600 fz14 text-amber-600 f aic g5">
                        <Gavel size={14} />
                        {t("placeBidAgain")}
                      </div>
                    )}
                  </div>
                </Link>
              </>
            }
          />
        </div>
      }
    />
  );
}
