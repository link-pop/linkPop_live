"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";
import { CollectionsContext } from "@/components/Context/CollectionsContext";
import { useContext } from "react";
import {
  BRAND_INVERT_CLASS,
  COLLECTIONS_USER_LISTS_ROUTE,
} from "@/lib/utils/constants";
import { SITE1 } from "@/config/env";
import useWindowWidth from "@/hooks/useWindowWidth";
import { getUserCollectionsCounts } from "@/lib/actions/getUserCollectionsCounts";

export default function UserListsNavigation({
  mongoUser,
  currentListId,
  systemLists,
  userLists,
  refreshUserLists,
  subscriptions = [],
  subscribers = [],
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const { collectionsSearchResults } = useContext(CollectionsContext);
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
        const countsData = await getUserCollectionsCounts(
          systemLists,
          safeUserLists,
          subscriptions,
          subscribers
        );
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
    subscriptions.length,
    subscribers.length,
  ]);

  function handleListChange(listId) {
    router.push(`${COLLECTIONS_USER_LISTS_ROUTE}/${listId}`);
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
        lastUserProfileImages: list.lastUserProfileImages || [], // Add lastUserProfileImages for search results
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
        lastUserProfileImages: list.lastUserProfileImages || [], // Add lastUserProfileImages
      })),
    ];
  };

  const displayLists = getDisplayLists();
  const isSearchMode = collectionsSearchResults !== null;

  // Don't show UserListsNavigation on mobile if not on userlistshub
  if (currentListId !== "userlistshub" && isMobileSm) return null;

  return (
    <div
      className={`UserListsNavigation maw400 ${
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
                  {counts[list.id] === 1 ? t("user") : t("users")}
                </span>
              )}
            </div>

            {/* User Profile Images Preview */}
            {list.lastUserProfileImages &&
              list.lastUserProfileImages.length > 0 && (
                <div className="relative f fwn wfc mla pl10 g2 mt3">
                  {list.lastUserProfileImages
                    .slice(0, 3)
                    .map((imageUrl, index) => (
                      <div
                        key={index}
                        className="w50 h50 bg-muted rounded-full overflow-hidden flex-shrink-0"
                      >
                        <img
                          src={imageUrl}
                          alt={`User ${index + 1}`}
                          className="w50 h50 object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </div>
                    ))}
                  {/* Show count indicator if more than 3 users */}
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
