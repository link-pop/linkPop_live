"use client";

import { useEffect, useRef } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";
import { update } from "@/lib/actions/crud";
import { useContext } from "@/components/Context/Context";
import SuggestionCard from "@/components/Suggestions/SuggestionCard";
import EmptyState from "@/components/ui/shared/EmptyState/EmptyState";
import SearchResultsHeader from "@/components/Search/SearchResultsHeader";
import LoadingSpinner from "@/components/ui/shared/LoadingSpinner/LoadingSpinner";
import { shouldShowFallbackMessage } from "@/lib/utils/suggestions/shouldShowFallbackMessage";
import { useCreatorSearch } from "@/hooks/useCreatorSearch";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { scrollToTopSmooth } from "@/lib/utils/scrollToTop";

export default function SearchCreatorResults({
  mongoUser,
  searchParams,
  onSearchComplete,
  shouldClearResults = false,
  onClearComplete,
  onUpdateSearchParams,
}) {
  const { t } = useTranslation();
  const { toastSet } = useContext();
  const isInitialMount = useRef(true);
  const lastSearchParamsRef = useRef({});

  const {
    results,
    isLoading,
    approach,
    nameFilterFallback,
    totalCount,
    hasMore,
    error,
    performSearch,
    loadMore,
    removeResult,
    hasResults,
    hasSearchParams,
    clearSearch,
  } = useCreatorSearch(20);

  // Set up infinite scroll
  const { containerRef } = useInfiniteScroll(loadMore, hasMore, isLoading);

  // Clear results when shouldClearResults is true
  useEffect(() => {
    if (shouldClearResults) {
      clearSearch();
      // Notify parent that clearing is complete
      if (onClearComplete) {
        onClearComplete();
      }
    }
  }, [shouldClearResults, clearSearch, onClearComplete]);

  // Perform search when searchParams change - but not on initial mount with empty params
  useEffect(() => {
    const doSearch = async () => {
      // Check if we have meaningful search parameters
      const hasMeaningfulParams = Object.entries(searchParams).some(
        ([key, value]) => {
          // Don't count showPaidOnly as a search parameter since it's just a filter
          if (
            key === "showPaidOnly" ||
            key === "displayAllUsersIfNoMatchFoundForSuggestions"
          ) {
            return false;
          }
          return value !== "" && value !== false;
        }
      );

      // Skip search on initial mount if no meaningful parameters
      if (isInitialMount.current && !hasMeaningfulParams) {
        isInitialMount.current = false;
        return;
      }

      // Check if search params actually changed (excluding initial mount)
      if (!isInitialMount.current) {
        const searchParamsChanged =
          JSON.stringify(searchParams) !==
          JSON.stringify(lastSearchParamsRef.current);

        if (searchParamsChanged) {
          // Clear existing results immediately when search params change
          clearSearch();

          if (hasMeaningfulParams) {
            // Scroll to top when search params change
            scrollToTopSmooth();
          }
        }
      }

      isInitialMount.current = false;
      lastSearchParamsRef.current = { ...searchParams };

      // Only perform search if we have meaningful parameters
      if (hasMeaningfulParams) {
        const result = await performSearch(searchParams);
        if (onSearchComplete) {
          onSearchComplete();
        }
      } else {
        // If no meaningful parameters, just complete the search
        if (onSearchComplete) {
          onSearchComplete();
        }
      }
    };

    doSearch();
  }, [searchParams, performSearch, onSearchComplete, clearSearch]);

  // Handle removing a suggestion (hiding it)
  const handleRemoveSuggestion = async (userId) => {
    // Remove from current results list immediately for UI feedback
    removeResult(userId);

    // Save the hidden suggestion to user's preferences
    if (mongoUser?._id) {
      try {
        // Get the current hidden suggestions or initialize to empty array
        const currentHiddenSuggestions = Array.isArray(
          mongoUser.hiddenSuggestions
        )
          ? [...mongoUser.hiddenSuggestions]
          : [];

        // Add the new hidden suggestion
        const updatedHiddenSuggestions = [...currentHiddenSuggestions, userId];

        // Update the user's preferences
        await update({
          col: "users",
          data: { _id: mongoUser._id },
          update: { hiddenSuggestions: updatedHiddenSuggestions },
          revalidate: ["/discover/search"],
        });

        toastSet({
          title: t("creatorHidden") || "Creator hidden",
          description:
            t("creatorWillNotAppearInFutureSearches") ||
            "This creator will not appear in future searches",
        });
      } catch (error) {
        console.error("Failed to hide creator:", error);
        toastSet({
          title: t("error"),
          description: t("failedToHideCreator") || "Failed to hide creator",
          variant: "destructive",
        });
      }
    }
  };

  // Handle removing a search tag
  const handleRemoveTag = (tagKey) => {
    if (onUpdateSearchParams) {
      // Create new search params with the tag removed
      const newSearchParams = { ...searchParams };

      // Clear the specific tag
      if (tagKey === "preferCreatorName") {
        newSearchParams.preferCreatorName = "";
      } else if (tagKey === "preferAge") {
        newSearchParams.preferAge = "";
      } else if (tagKey === "preferGender") {
        newSearchParams.preferGender = "";
      } else if (tagKey === "preferRaceEthnicity") {
        newSearchParams.preferRaceEthnicity = "";
      } else if (tagKey === "preferHairColor") {
        newSearchParams.preferHairColor = "";
      } else if (tagKey === "preferBodyType") {
        newSearchParams.preferBodyType = "";
      } else if (tagKey === "preferCountry") {
        newSearchParams.preferCountry = "";
        newSearchParams.preferCountryCode = ""; // Also clear country code
      }

      onUpdateSearchParams(newSearchParams);
    }
  };

  // Check if we should show the fallback message
  const showFallbackMessage = shouldShowFallbackMessage(
    mongoUser,
    approach,
    nameFilterFallback
  );

  if (!hasSearchParams) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">
          {t("startSearching") || "Start Searching"}
        </h3>
        <p className="text-foreground/60">
          {t("useFiltersToSearchCreators") ||
            "Use the filters on the left to search for creators"}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2 text-destructive">
          {t("searchError") || "Search Error"}
        </h3>
        <p className="text-foreground/60">{error}</p>
      </div>
    );
  }

  return (
    <div ref={containerRef}>
      <SearchResultsHeader
        totalCount={totalCount}
        approach={approach}
        isLoading={isLoading}
        mongoUser={mongoUser}
        searchParams={searchParams}
        onRemoveTag={handleRemoveTag}
      />

      {/* Show fallback message only when appropriate */}
      {showFallbackMessage && hasResults && (
        <div className="border-[var(--color-brand)] border-2 mb-4 p-3 bg-accent/10 rounded-md text-sm text-foreground/70 text-center">
          {t("noExactMatchFound") ||
            "No 100% match was found - showing all creators"}
        </div>
      )}

      {/* Loading state */}
      {isLoading && !hasResults && (
        <div className="text-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Results grid */}
      {hasResults && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {results.map((user, index) => (
            <SuggestionCard
              key={user._id}
              user={user}
              index={index}
              onRemove={handleRemoveSuggestion}
              currentUser={mongoUser}
              searchParams={searchParams}
            />
          ))}
        </div>
      )}

      {/* Infinite scroll loading indicator */}
      {isLoading && hasResults && (
        <div className="text-center py-6">
          <LoadingSpinner size="md" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !hasResults && hasSearchParams && (
        <EmptyState
          message={t("noCreatorsFound") || "No creators found"}
          description={
            t("tryAdjustingFilters") || "Try adjusting your search filters"
          }
        />
      )}
    </div>
  );
}
