"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getListCounts } from "@/lib/actions/getListCounts";
import { useTranslation } from "@/components/Context/TranslationContext";
import { ContentDepotContext } from "@/components/Context/ContentDepotContext";
import { useContext } from "react";
import {
  BRAND_INVERT_CLASS,
  CONTENT_DEPOT_LIST_ROUTE,
} from "@/lib/utils/constants";
import { SITE1 } from "@/config/env";

import useWindowWidth from "@/hooks/useWindowWidth";

export default function ContentDepotListNavigation({
  mongoUser,
  currentListId,
  systemLists,
  userLists,
  refreshUserLists,
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const { contentDepotSearchResults } = useContext(ContentDepotContext);
  const [counts, setCounts] = useState({});
  const [isLoadingCounts, setIsLoadingCounts] = useState(true);
  const { isMobileSm } = useWindowWidth();

  // Ensure userLists is always an array
  const safeUserLists = Array.isArray(userLists) ? userLists : [];

  // Fetch counts for each list type
  useEffect(() => {
    async function fetchCounts() {
      if (!mongoUser?._id) {
        setIsLoadingCounts(false);
        return;
      }

      try {
        setIsLoadingCounts(true);
        const countsData = await getListCounts(systemLists, safeUserLists);
        setCounts(countsData || {});
      } catch (error) {
        console.error("❌ Error fetching list counts:", error);
        setCounts({});
      } finally {
        setIsLoadingCounts(false);
      }
    }

    fetchCounts();
  }, [
    mongoUser?._id,
    safeUserLists.length,
    JSON.stringify(safeUserLists.map((list) => list.attachmentCount)),
  ]);

  function handleListChange(listId) {
    router.push(`${CONTENT_DEPOT_LIST_ROUTE}/${listId}`);
  }

  // Use search results if available, otherwise use all lists
  const getDisplayLists = () => {
    if (contentDepotSearchResults !== null) {
      // Show search results
      return contentDepotSearchResults.map((list) => ({
        id: list.slug,
        name: list.name,
        isSystem: false,
        count: counts[list.slug] || 0,
        color: list.color,
        icon: list.icon,
        lastAttachmentUrls: list.lastAttachmentUrls || [], // Add lastAttachmentUrls for search results
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
      ...(safeUserLists || []).map((list) => ({
        id: list.slug,
        name: list.name,
        isSystem: false,
        count: counts[list.slug] || 0,
        color: list.color,
        icon: list.icon,
        lastAttachmentUrls: list.lastAttachmentUrls || [], // Add lastAttachmentUrls
      })),
    ];
  };

  const displayLists = getDisplayLists();
  const isSearchMode = contentDepotSearchResults !== null;

  // ! don't show ContentDepotListNavigation on mobile if not on userlistshub
  if (currentListId !== "userlistshub" && isMobileSm) return null;

  return (
    <div
      className={`ContentDepotListNavigation maw400 ${
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
              <span
                className={`fz12 opacity-70 ${SITE1 ? BRAND_INVERT_CLASS : ""}`}
              >
                {list.count} items
              </span>
            </div>

            {/* Attachment Preview Images */}
            {list.lastAttachmentUrls && list.lastAttachmentUrls.length > 0 && (
              <div className="relative f fwn wfc mla pl10 g2 mt3">
                {list.lastAttachmentUrls.slice(0, 3).map((url, index) => (
                  <div
                    key={index}
                    className="w50 h50 bg-muted rounded overflow-hidden flex-shrink-0"
                  >
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w50 h50 object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                ))}
                {/* Show count indicator if more than 3 attachments */}
                {list.count > 3 && (
                  <div className="absolute r0 w20 h20 bg-muted/50 rounded fcc fz10 text-foreground">
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
