"use client";

import { update } from "@/lib/actions/crud";
import { useQueryClient } from "@tanstack/react-query";
import { useContext } from "@/components/Context/Context";
import { useTranslation } from "@/components/Context/TranslationContext";

export default function PostAddToArchive({ post, iconClassName }) {
  const isArchived = post.active === false;
  const queryClient = useQueryClient();
  const { toastSet } = useContext();
  const { t } = useTranslation();

  async function addToArchive() {
    const res = await update({
      col: "feeds",
      data: { _id: post._id },
      update: { active: isArchived },
    });

    toastSet({
      isOpen: true,
      title: isArchived ? t("postRestored") : t("postArchived"),
    });

    // Invalidate posts queries to trigger refetch
    queryClient.invalidateQueries({ queryKey: ["posts"] });
  }

  return (
    <div onClick={addToArchive} className={`${iconClassName}`}>
      {isArchived ? t("restorePost") : t("addToArchive")}
    </div>
  );
}
