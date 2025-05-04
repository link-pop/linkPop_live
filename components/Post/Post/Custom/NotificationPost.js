"use client";

import { useNotification } from "@/components/Context/NotificationContext";
import Link from "next/link";
import { useEffect } from "react";
import Post from "../Post";
import CreatedBy from "../CreatedBy";
import getNotificationIcon from "@/components/Context/getNotificationIcon";
import removeHtmlFromText from "@/lib/utils/removeHtmlFromText";

export default function NotificationPost(props) {
  const {
    post: notification,
    showCreatedAtTimeAgo = true,
    showNotificationUnread = true,
    className = "",
    onClick,
  } = props;
  const { markAsRead } = useNotification();

  useEffect(() => {
    // Mark as read when viewed
    if (!notification.read) {
      markAsRead(notification._id);
    }
  }, [notification, markAsRead]);

  const handleClick = (e) => {
    onClick?.(e);
  };

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
                    {getNotificationIcon()}
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
