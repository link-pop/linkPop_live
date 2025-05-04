"use client";

import { useEffect } from "react";
import { useNotification } from "@/components/Context/NotificationContext";
import { useChat } from "@/components/Context/ChatContext";
import SOCKET_EVENTS from "@/chatServer/constants/socketEvents";

export default function ChatNotificationHandler({ chatId, mongoUser }) {
  const { notifications, markAllAsRead } = useNotification();
  const { socket, connected } = useChat();

  useEffect(() => {
    if (!socket || !connected || !chatId || !mongoUser?._id) return;

    // Find all unread notifications for this chat
    const chatNotifications = notifications.filter(
      (notification) =>
        notification.type === "message" &&
        notification.link === `/chatrooms?chatId=${chatId}` &&
        !notification.read
    );

    // Mark each notification as read
    chatNotifications.forEach((notification) => {
      socket.emit(SOCKET_EVENTS.NOTIFICATION.READ, { notificationId: notification._id });
    });
  }, [chatId, mongoUser?._id, notifications, socket, connected]);

  // This is a utility component that doesn't render anything
  return null;
}
