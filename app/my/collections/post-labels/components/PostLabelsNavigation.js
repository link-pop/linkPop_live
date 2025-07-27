"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";
import { CollectionsContext } from "@/components/Context/CollectionsContext";
import { useContext } from "react";
import {
  BRAND_INVERT_CLASS,
  COLLECTIONS_POST_LABELS_ROUTE,
} from "@/lib/utils/constants";
import { SITE1 } from "@/config/env";
import useWindowWidth from "@/hooks/useWindowWidth";

export default function PostLabelsNavigation({
  mongoUser,
  currentListId,
  systemLists,
  postLabelLists,
  refreshPostLabelLists,
  allPostLabels = [],
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const { collectionsSearchResults } = useContext(CollectionsContext);
  const [counts, setCounts] = useState({});
  const [isLoadingCounts, setIsLoadingCounts] = useState(true);
  const { isMobileSm } = useWindowWidth();

  // Ensure postLabelLists is always an array
  const safePostLabelLists = Array.isArray(postLabelLists)
    ? postLabelLists
    : [];

  // Fetch counts for each list type
  useEffect(() => {
    async function fetchCounts() {
      if (!mongoUser?._id) {
        setIsLoadingCounts(false);
        return;
      }

      try {
        setIsLoadingCounts(true);

        // Calculate counts for system lists
        const systemCounts = {};
        systemCounts["all-post-labels"] = allPostLabels.length;

        // Calculate counts for custom lists
        const customCounts = {};
        safePostLabelLists.forEach((list) => {
          customCounts[list.slug] = list.postLabelIds?.length || 0;
        });

        setCounts({ ...systemCounts, ...customCounts });
      } catch (error) {
        console.error("❌ Error fetching post label list counts:", error);
        setCounts({});
      } finally {
        setIsLoadingCounts(false);
      }
    }

    fetchCounts();
  }, [mongoUser?._id, safePostLabelLists.length, allPostLabels.length]);

  function handleListChange(listId) {
    router.push(`${COLLECTIONS_POST_LABELS_ROUTE}/${listId}`);
  }

  // Use search results if available, otherwise use all lists
  const getDisplayLists = () => {
    if (collectionsSearchResults !== null) {
      // Show search results
      return collectionsSearchResults.map((list) => ({
        id: list.slug,
        name: list.name,
        isSystem: false,
        count: counts[list.slug] || 0,
        color: list.color,
        icon: list.icon,
        lastPostLabelThumbnails: list.lastPostLabelThumbnails || [],
        isSearchResult: true,
      }));
    }

    // Show all lists (normal mode)
    return [
      ...Object.values(systemLists).map((list) => ({
        ...list,
        isSystem: true,
        count: counts[list.id] || 0,
      })),
      ...(safePostLabelLists || []).map((list) => ({
        id: list.slug,
        name: list.name,
        isSystem: false,
        count: counts[list.slug] || 0,
        color: list.color,
        icon: list.icon,
        lastPostLabelThumbnails: list.lastPostLabelThumbnails || [],
      })),
    ];
  };

  const displayLists = getDisplayLists();
  const isSearchMode = collectionsSearchResults !== null;

  // ! don't show PostLabelsNavigation on mobile if not on userlistshub
  if (currentListId !== "userlistshub" && isMobileSm) return null;

  return (
    <div
      className={`PostLabelsNavigation maw400 ${
        isMobileSm ? "maw1000" : ""
      } wf h-full fc g0 bg-background border-r border-border `}
    >
      {/* List items */}
      <div className="fc g0 py10 !pt0">
        {/* Search results or No results message */}
        {isSearchMode && displayLists.length === 0 && (
          <div className="py8 px12 text-center">
            <span className="fz12 text-muted-foreground">{t("noResults")}</span>
          </div>
        )}

        {displayLists.map((list) => (
          <div
            key={list.id}
            onClick={() => handleListChange(list.id)}
            className={`f fwn py8 px12 cp transition-colors border-b ${
              currentListId === list.id
                ? "bg-accent text-white"
                : "bg-transparent hover:bg-accent/50 text-foreground"
            }`}
          >
            <div className="fc g5">
              <span
                className={`!wbba fz14 fw500 ${
                  SITE1 ? BRAND_INVERT_CLASS : ""
                }`}
              >
                {t(list?.name) || list.name}
              </span>

              {/* Count display */}
              {!isLoadingCounts && counts[list.id] !== undefined && (
                <span className="fz12 text-muted-foreground">
                  {counts[list.id]}{" "}
                  {counts[list.id] === 1 ? t("postLabel") : t("postLabels")}
                </span>
              )}
            </div>

            {/* Post Label Thumbnails Preview */}
            {list.lastPostLabelThumbnails &&
              list.lastPostLabelThumbnails.length > 0 && (
                <div className="relative f fwn wfc mla pl10 g2 mt3">
                  {list.lastPostLabelThumbnails
                    .slice(0, 3)
                    .map((thumbnail, index) => (
                      <div
                        key={index}
                        className="w50 h50 bg-muted rounded overflow-hidden flex-shrink-0"
                      >
                        <img
                          src={thumbnail}
                          alt={`Post Label ${index + 1}`}
                          className="w50 h50 object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </div>
                    ))}
                  {/* Show count indicator if more than 3 post labels */}
                  {list.count > 3 && (
                    <div className="absolute r0 w20 h20 bg-muted/50 rounded-full fcc fz10 text-foreground">
                      +{list.count - 3}
                    </div>
                  )}
                </div>
              )}
          </div>
        ))}
      </div>
    </div>
  );
}
