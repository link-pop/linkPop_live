"use client";

import { useNotification } from "@/components/Context/NotificationContext";
import { useChat } from "@/components/Context/ChatContext";
import { useState, useEffect } from "react";
import { BRAND_INVERT_CLASS } from "@/lib/utils/constants";

export default function NotificationBadge({ id, className = "" }) {
  const { notifications, unreadCount, messageCount } = useNotification();
  const { getTotalUnreadCount } = useChat();
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    // Wait for notifications to be loaded
    if (!notifications || !Array.isArray(notifications)) return;

    // TODO !!!!! show NOT just total, but total messages from unique users 
    if (id === "messages") {
      // Use the total unread count from chat context
      setDisplayCount(getTotalUnreadCount());
    } else if (id === "notifications") {
      // For notifications nav item, count all non-message notifications
      const nonMessageCount = notifications.filter((notification) => {
        return !notification.read && notification.type !== "message";
      }).length;
      setDisplayCount(nonMessageCount);
    }
  }, [id, notifications, getTotalUnreadCount]);

  // Don't show badge if no unread notifications of this type
  if (displayCount === 0) return null;

  return (
    <div
      className={`bg_brand poa t-3 r-3 bg-red-500 text-white rf min-w-[18px] h-[18px] fc jcc aic text-xs font-bold ${className}`}
    >
      <span className={`${BRAND_INVERT_CLASS}`}>
        {displayCount > 99 ? "99+" : displayCount}
      </span>
    </div>
  );
}
