"use client";

import { getUserFullPostLabelLists } from "@/lib/actions/getUserFullPostLabelLists";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/components/Context/TranslationContext";
import { BRAND_INVERT_CLASS } from "@/lib/utils/constants";
import HorizontalScroll from "@/components/ui/shared/HorizontalScroll";
import { SITE1 } from "@/config/env";

export default function UserFullPostUserPostLabelPosts({
  mongoUser,
  visitedMongoUser,
  className = "",
  horizontalScrollstyle = {},
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  // Fetch user's post label lists with counts
  const { data: postLabelLists = [], isLoading: isLoadingLists } = useQuery({
    queryKey: ["userPostLabelLists", visitedMongoUser?._id],
    queryFn: async () => {
      if (!visitedMongoUser?._id) return [];

      try {
        return await getUserFullPostLabelLists(visitedMongoUser._id);
      } catch (error) {
        console.error("❌ Error fetching post label lists:", error);
        return [];
      }
    },
    enabled: Boolean(visitedMongoUser?._id),
  });

  function handlePostLabelChange(listId) {
    const params = new URLSearchParams(searchParams);

    if (listId === "all") {
      params.delete("postLabel");
    } else {
      params.set("postLabel", listId);
    }

    router.push(`?${params.toString()}`);
  }

  const postLabelParam = searchParams.get("postLabel");
  const currentValue = postLabelParam || "all";

  // Don't render if no post label lists or user is not the owner
  if (!postLabelLists.length || !visitedMongoUser?._id) {
    return null;
  }

  return (
    <div className={`maw600 wf oxa f g5 ${className}`}>
      <HorizontalScroll
        className={`px10 pb8 g15`}
        style={horizontalScrollstyle}
      >
        {/* All posts option */}
        <div
          onClick={() => handlePostLabelChange("all")}
          className={`wsn py5 px15 br20 cp flex-shrink-0 transition-colors ${
            currentValue === "all" ? "bg_brand" : "bg-accent hover:bg-accent/50"
          }`}
        >
          <span className={`${SITE1 ? BRAND_INVERT_CLASS : ""}`}>
            {t("all")}
          </span>
        </div>

        {/* Post label lists */}
        {postLabelLists.map((list) => (
          <div
            key={list._id}
            onClick={() => handlePostLabelChange(list._id)}
            className={`wsn py5 px15 br20 cp flex-shrink-0 transition-colors ${
              currentValue === list._id
                ? "bg_brand"
                : "bg-accent hover:bg-accent/50"
            }`}
          >
            <span className={`${SITE1 ? BRAND_INVERT_CLASS : ""}`}>
              {list.name} {list.count || 0}
            </span>
          </div>
        ))}
      </HorizontalScroll>
    </div>
  );
}
