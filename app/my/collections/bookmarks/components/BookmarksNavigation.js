"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";
import { CollectionsContext } from "@/components/Context/CollectionsContext";
import { useContext } from "react";
import {
  BRAND_INVERT_CLASS,
  COLLECTIONS_BOOKMARKS_ROUTE,
} from "@/lib/utils/constants";
import { SITE1 } from "@/config/env";
import useWindowWidth from "@/hooks/useWindowWidth";
import { getBookmarkCollectionsCounts } from "@/lib/actions/getBookmarkCollectionsCounts";

export default function BookmarksNavigation({
  mongoUser,
  currentListId,
  systemLists,
  bookmarkLists,
  refreshBookmarkLists,
  allBookmarks = [],
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const { collectionsSearchResults } = useContext(CollectionsContext);
  const [counts, setCounts] = useState({});
  const [isLoadingCounts, setIsLoadingCounts] = useState(true);
  const { isMobileSm } = useWindowWidth();

  // Ensure bookmarkLists is always an array
  const safeBookmarkLists = Array.isArray(bookmarkLists) ? bookmarkLists : [];

  // Fetch counts for each list type
  useEffect(() => {
    async function fetchCounts() {
      if (!mongoUser?._id) {
        setIsLoadingCounts(false);
        return;
      }

      try {
        setIsLoadingCounts(true);
        const countsData = await getBookmarkCollectionsCounts(
          systemLists,
          safeBookmarkLists,
          allBookmarks
        );
        setCounts(countsData || {});
      } catch (error) {
        console.error("❌ Error fetching bookmark list counts:", error);
        setCounts({});
      } finally {
        setIsLoadingCounts(false);
      }
    }

    fetchCounts();
  }, [mongoUser?._id, safeBookmarkLists.length, allBookmarks.length]);

  function handleListChange(listId) {
    router.push(`${COLLECTIONS_BOOKMARKS_ROUTE}/${listId}`);
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
        lastBookmarkThumbnails: list.lastBookmarkThumbnails || [], // Add lastBookmarkThumbnails for search results
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
      ...(safeBookmarkLists || []).map((list) => ({
        id: list.slug,
        name: list.name,
        isSystem: false,
        count: counts[list.slug] || 0,
        color: list.color,
        icon: list.icon,
        lastBookmarkThumbnails: list.lastBookmarkThumbnails || [], // Add lastBookmarkThumbnails
      })),
    ];
  };

  const displayLists = getDisplayLists();
  const isSearchMode = collectionsSearchResults !== null;

  // ! don't show BookmarksNavigation on mobile if not on userlistshub
  if (currentListId !== "userlistshub" && isMobileSm) return null;

  return (
    <div
      className={`BookmarksNavigation maw400 ${
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
                  {counts[list.id] === 1 ? t("bookmark") : t("bookmarks")}
                </span>
              )}
            </div>

            {/* Bookmark Thumbnails Preview */}
            {list.lastBookmarkThumbnails &&
              list.lastBookmarkThumbnails.length > 0 && (
                <div className="relative f fwn wfc mla pl10 g2 mt3">
                  {list.lastBookmarkThumbnails
                    .slice(0, 3)
                    .map((thumbnail, index) => (
                      <div
                        key={index}
                        className="w50 h50 bg-muted rounded overflow-hidden flex-shrink-0"
                      >
                        <img
                          src={thumbnail}
                          alt={`Bookmark ${index + 1}`}
                          className="w50 h50 object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </div>
                    ))}
                  {/* Show count indicator if more than 3 bookmarks */}
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
