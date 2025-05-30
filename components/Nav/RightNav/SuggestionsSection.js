"use client";

import { useTranslation } from "@/components/Context/TranslationContext";
import SuggestionCard from "@/components/Suggestions/SuggestionCard";
import { useSuggestions } from "@/hooks/useSuggestions";
import { usePriceFilter } from "@/hooks/usePriceFilter";
import { update } from "@/lib/actions/crud";
import { useContext } from "@/components/Context/Context";
import EmptyState from "@/components/ui/shared/EmptyState/EmptyState";
import FixedHeightContainer from "@/components/ui/shared/FixedHeightContainer/FixedHeightContainer";
import SuggestionHeaderSection from "@/components/Suggestions/SuggestionHeaderSection";
import DotPagination from "@/components/ui/shared/Pagination/DotPagination";
import TagProgressBar from "@/components/ui/shared/TagProgressBar/TagProgressBar";
import { MIN_VISITED_CREATOR_TAGS_FOR_SMART_MATCHING } from "@/lib/utils/constants";
import { hasUserPreferences } from "@/lib/utils/hasUserPreferences";
import { shouldShowFallbackMessage } from "@/lib/utils/suggestions/shouldShowFallbackMessage";

/**
 * SuggestionsSection displays personalized creator recommendations
 * Only shown to users with profileType="fan"
 */
export default function SuggestionsSection() {
  const { t } = useTranslation();
  const { toastSet } = useContext();

  // Price filter state
  const { showPaidOnly, toggleFilter } = usePriceFilter(); // Default to paid only

  const {
    visibleSuggestions,
    suggestions,
    suggestionsApproach,
    isLoading,
    isUserFan,
    currentPage,
    totalPages,
    handleRemoveSuggestion,
    goNextPage,
    goPrevPage,
    setCurrentPage,
    fillerSlots,
    currentUser,
    refreshSuggestions,
    refreshWithNewBatch,
  } = useSuggestions(20, 3, showPaidOnly);

  // Handle clearing all hidden suggestions
  const handleClearHiddenSuggestions = async () => {
    try {
      if (!currentUser?._id) return;

      // Update the user's preferences to clear hidden suggestions
      await update({
        col: "users",
        data: { _id: currentUser._id },
        update: { hiddenSuggestions: [] },
        revalidate: ["/"],
      });

      // Show success toast
      toastSet({
        title: t("hiddenSuggestionsCleared"),
        description:
          t("hiddenSuggestionsCleared") + " " + t("refreshingSuggestions"),
      });

      // Use refresh mechanism instead of reloading the page
      refreshSuggestions();
    } catch (error) {
      console.error("Failed to clear hidden suggestions:", error);
      toastSet({
        title: t("error"),
        description: t("errorClearingHiddenSuggestions"),
        variant: "destructive",
      });
    }
  };

  // If loading, show a skeleton loader
  if (isLoading) {
    return (
      <FixedHeightContainer>
        <div className="text-sm font-medium text-foreground/60 mb-4">
          {t("suggestions")}
        </div>
      </FixedHeightContainer>
    );
  }

  // If user is not a fan, don't show suggestions section
  if (!isUserFan) {
    return null;
  }

  // Check if there are no suggestions at all
  const hasSuggestions = suggestions.length > 0;

  // Check if user has any preferences set using the reusable function
  const userHasPreferences = hasUserPreferences(currentUser);

  // Determine whether to show the fallback message using the new utility
  const showFallbackMessage = shouldShowFallbackMessage(
    currentUser,
    suggestionsApproach
  );

  return (
    <FixedHeightContainer>
      <SuggestionHeaderSection
        currentUser={currentUser}
        handleClearHiddenSuggestions={handleClearHiddenSuggestions}
        onClearAllSuggestions={refreshSuggestions}
        onRefreshSuggestions={refreshWithNewBatch}
        showPaidOnly={showPaidOnly}
        onTogglePriceFilter={toggleFilter}
      />

      {/* Progress bar for preferences */}
      {!userHasPreferences && currentUser?.lastVisitedCreatorsTags && (
        <div className="mb-4">
          <TagProgressBar
            value={Math.max(
              currentUser.lastVisitedCreatorsTags.raceEthnicity?.length || 0,
              currentUser.lastVisitedCreatorsTags.hairColor?.length || 0,
              currentUser.lastVisitedCreatorsTags.bodyType?.length || 0
            )}
            max={MIN_VISITED_CREATOR_TAGS_FOR_SMART_MATCHING}
          />
        </div>
      )}

      {/* Show fallback message only when appropriate */}
      {showFallbackMessage && hasSuggestions && (
        <div className="border-[var(--color-brand)] border-2 mb-3 p-2 bg-accent/10 rounded-md text-xs text-foreground/70 text-center">
          {t("noExactMatchFound") ||
            "No 100% match was found - showing all creators"}
        </div>
      )}

      {/* // ! don't delete: For devs only: show the approach used to generate suggestions */}
      {currentUser.isDev && (
        <div className="mb-3 p-2 bg-accent/10 rounded-md text-xs text-foreground/70 text-center">
          DEV: suggestionsApproach: {suggestionsApproach} | showPaidOnly:{" "}
          {showPaidOnly.toString()}
        </div>
      )}

      {/* User suggestions list - fixed height container */}
      <div className="space-y-3" style={{ minHeight: "328px" }}>
        {hasSuggestions ? (
          <>
            {visibleSuggestions.map((user, index) => (
              <SuggestionCard
                key={user._id}
                user={user}
                index={index}
                onRemove={handleRemoveSuggestion}
                currentUser={currentUser}
              />
            ))}

            {/* Empty placeholder slots to maintain height */}
            {fillerSlots.map((_, idx) => (
              <div key={`filler-${idx}`} className="h-32" /> // Same height as a card
            ))}
          </>
        ) : (
          <EmptyState
            message={t("noSuggestions") || "No suggestions available"}
          />
        )}
      </div>
      {/* Pagination controls */}
      <DotPagination
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
        goNextPage={goNextPage}
        goPrevPage={goPrevPage}
        className="mt-4"
      />
    </FixedHeightContainer>
  );
}
