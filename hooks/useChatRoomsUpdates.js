"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useChat } from "@/components/Context/ChatContext";
import SOCKET_EVENTS from "@/chatServer/constants/socketEvents";

export default function useChatRoomsUpdates(chatId = null) {
  const { socket, connected } = useChat();
  const queryClient = useQueryClient();

  // TODO !!!!! slows down app a lot ???
  // Refetch when socket reconnects or chatId changes
  useEffect(() => {
    if (connected) {
      // Always refetch chat rooms list
      queryClient.invalidateQueries({
        queryKey: ["posts", "chatrooms"],
        type: "all",
      });

      // Refetch messages if we have a chatId
      if (chatId) {
        queryClient.invalidateQueries({
          queryKey: ["chat", "messages", chatId],
          type: "all",
        });
      }
    }
  }, [connected, chatId, queryClient]);

  useEffect(() => {
    if (!socket) return;

    const invalidateQueries = () => {
      // Always invalidate the chat rooms list
      queryClient.invalidateQueries({
        queryKey: ["posts", "chatrooms"],
        type: "all", // Invalidate all query instances
        refetchType: "all", // Refetch all pages for infinite queries
      });

      // Always invalidate messages for this chat room
      if (chatId) {
        queryClient.invalidateQueries({
          queryKey: ["chat", "messages", chatId],
          type: "all",
        });
      }
    };

    // Function to handle any chat message event
    const handleChatEvent = (event) => {
      // Extract chatId from the event name if present
      const eventChatId = event.split(":").pop();

      // Only handle chat message events
      if (
        event.startsWith("chat:message:received:") ||
        event.startsWith("chat:message:deleted:") ||
        event.startsWith("chat:message:hidden:")
      ) {
        console.log("Chat event received:", event);

        // If we're in a specific chat room, only update for events from this room
        if (chatId && eventChatId !== chatId) {
          return;
        }

        invalidateQueries();
      }
    };

    // Listen to all events
    socket.onAny(handleChatEvent);

    return () => {
      socket.offAny(handleChatEvent);
    };
  }, [socket, chatId, queryClient]);
}
