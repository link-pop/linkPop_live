"use client";

import { useTranslation } from "@/components/Context/TranslationContext";
import { useContext } from "@/components/Context/Context";
import { update } from "@/lib/actions/crud";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function PostPinMessage({ post, iconClassName, mongoUser }) {
  const { t } = useTranslation();
  const { toastSet } = useContext();
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleTogglePin = async () => {
    if (isLoading || !mongoUser || !post._id) return;

    try {
      setIsLoading(true);

      const newPinStatus = !post.isPinned;

      const result = await update({
        col: { name: "chatmessages" },
        data: { _id: post._id },
        update: { isPinned: newPinStatus },
        skipOwnershipCheck: true,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      // Update the post object locally
      post.isPinned = newPinStatus;

      // Invalidate queries to refresh the messages
      queryClient.invalidateQueries({
        queryKey: ["chat", "messages", post.chatRoomId],
      });

      // Show success toast
      toastSet({
        isOpen: true,
        title: newPinStatus ? t("messagePinned") : t("messageUnpinned"),
      });
    } catch (error) {
      console.error("❌ Error toggling pin status:", error);
      toastSet({
        isOpen: true,
        title: t("errorTogglingPin"),
        text: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={iconClassName} onClick={handleTogglePin}>
      {isLoading ? t("loading") : post.isPinned ? t("unpin") : t("pin")}
    </div>
  );
}
