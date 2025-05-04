"use client";

import { useTranslation } from "@/components/Context/TranslationContext";
import { getAll } from "@/lib/actions/crud";
import { useEffect, useState } from "react";

export default function UserFullPostFansCount({ post }) {
  const [fansCount, setFansCount] = useState(0);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchFansCount = async () => {
      try {
        if (post?._id) {
          const subscriptions = await getAll({
            col: "subscriptions",
            data: {
              subscribedTo: post._id,
            },
          });
          setFansCount(subscriptions?.length || 0);
        }
      } catch (error) {
        console.error("Error fetching fans count:", error);
      }
    };

    // Only fetch if the user has enabled showing fans count
    if (post?.showFansCount !== false) {
      fetchFansCount();
    }
  }, [post?._id, post?.showFansCount]);

  return (
    post?.showFansCount !== false &&
    fansCount > 0 && (
      <div className={`mt10 ml13 f aic g5 fz12`}>
        <span className={`fw600`}>{fansCount}</span>
        <span>{t("fans")}</span>
      </div>
    )
  );
}
