"use client";

import { useNotification } from "@/components/Context/NotificationContext";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Post from "../Post";
import CreatedBy from "../CreatedBy";
import getNotificationIcon from "@/components/Context/getNotificationIcon";
import removeHtmlFromText from "@/lib/utils/removeHtmlFromText";
import { useTranslation } from "@/components/Context/TranslationContext";
import NotificationAuctionPost from "./NotificationAuctionPost";
import { NOTIFICATIONS_ROUTE } from "@/lib/utils/constants";

export default function NotificationPost(props) {
  const {
    post: notification,
    showCreatedAtTimeAgo = true,
    showNotificationUnread = true,
    className = "",
    onClick,
  } = props;
  const { markAsRead } = useNotification();
  const router = useRouter();
  const pathname = usePathname();
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

  // Check if this is an auction-related notification
  const isAuctionNotification = [
    "auction_won",
    "auction_sold",
    "auction_ended",
    "auction_outbid",
  ].includes(notification.type);

  // Check if we're on the notifications route
  const isOnNotificationsRoute = pathname.includes(NOTIFICATIONS_ROUTE);

  // If it's an auction notification, use the specialized component
  if (isAuctionNotification) {
    return (
      <NotificationAuctionPost
        {...props}
        isOnNotificationsRoute={isOnNotificationsRoute}
      />
    );
  }

  return (
    <Post
      {...props}
      onClick={handleClick}
      showIcons={false}
      // TODO !!!!! rename to showOtherIcons
      noOtherIcons={true}
      showTags={false}
      showCreatedAt={false}
      showCreatedAtTimeAgo={showCreatedAtTimeAgo}
      useCard={false}
      showAutoGenMongoFields={false}
      showCreatedBy={false}
      className={`fui border-b ${className}`}
      iconsClassName="poa r20 -t2"
      top={
        <div className="">
          <CreatedBy
            icon={getNotificationIcon(notification.type)}
            createdBy={notification.sourceUserId}
            className="wbba f fwn !g5 mr5"
            bottomClassName="-mt12 fsi fw300"
            bottom={
              <>
                <Link
                  href={notification.link || "#"}
                  className={`p10 f g10 mb10 ${
                    !notification.read ? "bg-accent/10" : ""
                  } hover:bg-accent/20 transition-colors`}
                >
                  <div className="por shrink-0">
                    {getNotificationIcon(notification.type)}
                    {showNotificationUnread && !notification.read && (
                      <div className="poa t-1 r-1 w-2 h-2 rounded-full bg-red-500"></div>
                    )}
                  </div>

                  <div className="fc g5 wf">
                    <p className="text-sm text-muted-foreground">
                      {removeHtmlFromText(notification.content)}
                    </p>
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
