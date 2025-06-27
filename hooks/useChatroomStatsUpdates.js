"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useChat } from "@/components/Context/ChatContext";
import SOCKET_EVENTS from "@/chatServer/constants/socketEvents";

/**
 * Hook to listen for chatroom unread count updates and invalidate related queries
 * @param {Array} queryKey - The query key to invalidate (defaults to ["chatrooms", "chatroomStats"])
 * @param {string} userId - The user ID to filter events for (optional)
 */

// * deducts the unread count from the chatroom stats (all/unread)
export default function useChatroomStatsUpdates(
  queryKey = ["chatrooms", "chatroomStats"],
  userId = null
) {
  const { socket, connected, userId: contextUserId } = useChat();
  const queryClient = useQueryClient();
  const targetUserId = userId || contextUserId;

  useEffect(() => {
    if (!socket || !connected || !targetUserId) return;

    // Handle unread counts updates
    const handleUnreadCountsUpdate = (data) => {
      // Only process if this update is for the current user
      if (data.userId === targetUserId) {
        console.log(
          "🔄 Chatroom unread counts updated, invalidating stats query"
        );

        // Invalidate the chatroom stats query to trigger a refetch
        queryClient.invalidateQueries({
          queryKey: [...queryKey, targetUserId],
          type: "all",
        });
      }
    };

    // Listen for unread counts updates
    socket.on(SOCKET_EVENTS.CHAT.ROOM.UNREAD_COUNTS, handleUnreadCountsUpdate);

    return () => {
      socket.off(
        SOCKET_EVENTS.CHAT.ROOM.UNREAD_COUNTS,
        handleUnreadCountsUpdate
      );
    };
  }, [socket, connected, targetUserId, queryClient, queryKey]);

  // Also invalidate when socket reconnects to ensure fresh data
  useEffect(() => {
    if (connected && targetUserId) {
      queryClient.invalidateQueries({
        queryKey: [...queryKey, targetUserId],
        type: "all",
      });
    }
  }, [connected, targetUserId, queryClient, queryKey]);
}
