"use client";

import { useContext } from "@/components/Context/Context";
import { add, getOne } from "@/lib/actions/crud";
import { postHideOnSuccess } from "./Custom/postHideOnSuccess";
import { useQueryClient } from "@tanstack/react-query";
import { useChat } from "@/components/Context/ChatContext";
import SOCKET_EVENTS from "@/chatServer/constants/socketEvents";
import { useTranslation } from "@/components/Context/TranslationContext";

export default function PostHide({
  post,
  mongoUser,
  iconClassName,
  hiddenCol,
  queryKey,
  text,
}) {
  const queryClient = useQueryClient();
  const { toastSet } = useContext();
  const { socket } = useChat();
  const { t } = useTranslation();

  const handleHide = async () => {
    try {
      // Check if already hidden
      const existing = await getOne({
        col: hiddenCol,
        data: {
          userId: mongoUser._id,
          postId: post._id,
        },
      });

      if (!existing) {
        const response = await add({
          col: hiddenCol,
          data: {
            userId: mongoUser._id,
            postId: post._id,
          },
        });

        // Emit socket event for real-time hiding if it's a chat message
        if (post.chatRoomId) {
          socket.emit(SOCKET_EVENTS.CHAT.MESSAGE.HIDE, {
            chatId: post.chatRoomId,
            messageId: post._id,
          });
        }

        // Invalidate queries to trigger refetch
        queryClient.invalidateQueries({ queryKey: [queryKey] });

        // Update last message if needed
        await postHideOnSuccess({ post, col: hiddenCol });

        // Toast
        setTimeout(() => {
          toastSet({
            isOpen: true,
            title: t("itemHidden", { item: text }),
          });
        }, 1000);
      }
    } catch (error) {
      console.error(`Error hiding ${text}:`, error);
    }
  };

  return (
    <div onClick={handleHide} className={`hover:!bad ${iconClassName}`}>
      {t("hideItem", { item: text })}
    </div>
  );
}
