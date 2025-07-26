"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/components/Context/TranslationContext";
import { BRAND_INVERT_CLASS } from "@/lib/utils/constants";
import HorizontalScroll from "@/components/ui/shared/HorizontalScroll";
import { SITE1 } from "@/config/env";

export default function BookmarksMediaTypeSwitch({
  mongoUser,
  allBookmarks = [],
  customListFeedPosts = [],
  currentListContext = null,
  className = "",
  horizontalScrollstyle = {},
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const mediaTypes = [
    { value: "all", label: "all" },
    { value: "photo", label: "photo" },
    { value: "video", label: "video" },
    { value: "gif", label: "gif" },
  ];

  // Use react-query to calculate and cache the counts
  const {
    data: counts = mediaTypes.reduce((acc, type) => {
      acc[type.value] = 0;
      return acc;
    }, {}),
  } = useQuery({
    queryKey: [
      "bookmarksMediaCounts",
      mongoUser?._id,
      currentListContext?.id || "default",
      allBookmarks.length,
      customListFeedPosts.length,
    ],
    queryFn: async () => {
      if (!mongoUser?._id) {
        return mediaTypes.reduce((acc, type) => {
          acc[type.value] = 0;
          return acc;
        }, {});
      }

      try {
        let postsToAnalyze = [];

        if (currentListContext?.isCustom) {
          // For custom lists, use the pre-fetched feed posts
          postsToAnalyze = customListFeedPosts;
        } else {
          // For system lists (all-bookmarks), process bookmark objects
          postsToAnalyze = allBookmarks
            .map((bookmarkData) => {
              // For bookmarks: post data is in postId field (already populated)
              if (
                bookmarkData.postId &&
                typeof bookmarkData.postId === "object"
              ) {
                return bookmarkData.postId;
              }
              return null;
            })
            .filter(Boolean);
        }

        // Count media types
        const counts = {
          all: postsToAnalyze.length,
          photo: 0,
          video: 0,
          gif: 0,
        };

        postsToAnalyze.forEach((post) => {
          if (post.files && post.files.length > 0) {
            post.files.forEach((file) => {
              if (file.fileType === "video") {
                counts.video++;
              } else if (file.fileType === "image") {
                if (file.fileUrl && file.fileUrl.includes(".gif")) {
                  counts.gif++;
                } else {
                  counts.photo++;
                }
              }
            });
          }
        });

        return counts;
      } catch (error) {
        console.error("❌ Error calculating bookmark media counts:", error);
        return mediaTypes.reduce((acc, type) => {
          acc[type.value] = 0;
          return acc;
        }, {});
      }
    },
    enabled: Boolean(mongoUser?._id),
  });

  function handleTypeChange(value) {
    const params = new URLSearchParams(searchParams);

    if (value === "all") {
      params.delete("mediaType");
    } else {
      params.set("mediaType", value);
    }

    router.push(`?${params.toString()}`);
  }

  const typeParam = searchParams.get("mediaType");
  const currentValue = typeParam || "all";

  return (
    <div className={`px15 maw600 wf oxa f g5 ${className}`}>
      <HorizontalScroll
        className={`px10 pb8 g15`}
        style={horizontalScrollstyle}
      >
        {mediaTypes.map((type) => (
          <div
            key={type.value}
            onClick={() => handleTypeChange(type.value)}
            className={`wsn py5 px15 br20 cp flex-shrink-0 transition-colors ${
              currentValue === type.value
                ? "bg_brand"
                : "bg-accent hover:bg-accent/50"
            }`}
          >
            <span className={`${SITE1 ? BRAND_INVERT_CLASS : ""}`}>
              {t(type.label)} {counts[type.value] || 0}
            </span>
          </div>
        ))}
      </HorizontalScroll>
    </div>
  );
}
