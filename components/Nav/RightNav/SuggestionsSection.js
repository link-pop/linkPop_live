"use client";

import { useTranslation } from "@/components/Context/TranslationContext";
import SuggestionCard from "@/components/Suggestions/SuggestionCard";
import { useSuggestions } from "@/hooks/useSuggestions";
import { update } from "@/lib/actions/crud";
import { useContext } from "@/components/Context/Context";
import EmptyState from "@/components/ui/shared/EmptyState/EmptyState";
import FixedHeightContainer from "@/components/ui/shared/FixedHeightContainer/FixedHeightContainer";
import SuggestionHeaderSection from "@/components/Suggestions/SuggestionHeaderSection";
import DotPagination from "@/components/ui/shared/Pagination/DotPagination";

/**
 * SuggestionsSection displays personalized creator recommendations
 * Only shown to users with profileType="fan"
 */
export default function SuggestionsSection() {
  const { t } = useTranslation();
  const { toastSet } = useContext();
  const {
    visibleSuggestions,
    suggestions,
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
  } = useSuggestions(20, 3);

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

  return (
    <FixedHeightContainer>
      {/* Header with navigation */}
      <SuggestionHeaderSection
        currentUser={currentUser}
        handleClearHiddenSuggestions={handleClearHiddenSuggestions}
      />

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
