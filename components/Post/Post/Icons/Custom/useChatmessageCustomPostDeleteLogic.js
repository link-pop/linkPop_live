"use client";

import { useQueryClient } from "@tanstack/react-query";
import { postHideOnSuccess } from "./postHideOnSuccess";
import { useChat } from "@/components/Context/ChatContext";
import SOCKET_EVENTS from "@/chatServer/constants/socketEvents";

export default function useChatmessageCustomPostDeleteLogic({ post }) {
  const queryClient = useQueryClient();
  const { socket } = useChat();

  async function handleChatmessageDelete() {
    await postHideOnSuccess({ post, col: "chatmessages" });

    // Emit socket event for real-time deletion
    socket.emit(SOCKET_EVENTS.CHAT.MESSAGE.DELETE, {
      chatId: post.chatRoomId,
      messageId: post._id,
    });

    queryClient.invalidateQueries({
      queryKey: ["chat", "messages", post.chatRoomId],
    });
  }

  return { handleChatmessageDelete };
}
