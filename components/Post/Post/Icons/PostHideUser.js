"use client";

import { add } from "@/lib/actions/crud";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/components/Context/TranslationContext";
import { useContext } from "@/components/Context/Context";

export default function PostHideUser({ post, mongoUser, iconClassName }) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { toastSet } = useContext();

  const handleHideUser = async () => {
    try {
      const response = await add({
        col: "hiddenUsers",
        data: { userId: mongoUser._id, hiddenUserId: post.createdBy._id },
      });

      // Invalidate posts queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ["posts"] });

      toastSet({
        isOpen: true,
        title: t("userHidden"),
      });
    } catch (error) {
      console.error("Error hiding user:", error);
    }
  };

  return (
    <div onClick={handleHideUser} className={`hover:!bad ${iconClassName}`}>
      {t("hideUserPosts")}
    </div>
  );
}
