"use client";

import { useState, useEffect } from "react";
import { getSuggestedUsers } from "@/lib/actions/getSuggestedUsers";
import { getSerializedMongoUser } from "@/lib/utils/mongo/getMongoUser";
import { hideSuggestion } from "@/lib/utils/suggestions/hideSuggestion";

/**
 * Custom hook for managing user suggestions
 *
 * @param {number} limit - Maximum number of suggestions to fetch
 * @param {number} itemsPerPage - Number of suggestions to show per page
 * @param {boolean} showPaidOnly - Filter for paid creators only (default: true)
 * @returns {Object} Suggestions state and management functions
 */
export function useSuggestions(
  limit = 10,
  itemsPerPage = 3,
  showPaidOnly = true
) {
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsApproach, setSuggestionsApproach] = useState("none");
  const [nameFilterFallback, setNameFilterFallback] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isUserFan, setIsUserFan] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [skip, setSkip] = useState(0);

  const totalPages = Math.ceil((suggestions.length || 0) / itemsPerPage);

  // Fetch current user and suggestions
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Get current user to check if they're a fan
        const { mongoUser } = await getSerializedMongoUser();

        setCurrentUser(mongoUser);
        const isFan = mongoUser?.profileType === "fan";
        setIsUserFan(isFan);

        // Only fetch suggestions if user is a fan
        if (isFan) {
          const result = await getSuggestedUsers(limit, showPaidOnly, skip);

          // If no suggestions found and skip > 0, reset skip and try again
          if ((!result.users || result.users.length === 0) && skip > 0) {
            console.log("No suggestions found with skip, resetting to 0");
            setSkip(0);
            const resetResult = await getSuggestedUsers(limit, showPaidOnly, 0);
            setSuggestions(resetResult.users || []);
            setSuggestionsApproach(resetResult.approach || "none");
            setNameFilterFallback(resetResult.nameFilterFallback || false);
          } else {
            setSuggestions(result.users || []);
            setSuggestionsApproach(result.approach || "none");
            setNameFilterFallback(result.nameFilterFallback || false);
          }
        } else {
          setSuggestions([]);
          setSuggestionsApproach("none");
          setNameFilterFallback(false);
        }
      } catch (error) {
        setSuggestions([]);
        setSuggestionsApproach("error");
        setNameFilterFallback(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [limit, refreshTrigger, showPaidOnly, skip]);

  // Reset skip when showPaidOnly changes to ensure fresh results
  useEffect(() => {
    if (skip > 0) {
      setSkip(0);
    }
  }, [showPaidOnly]);

  // Handle "don't suggest" action
  const handleRemoveSuggestion = async (userId) => {
    // Remove from current suggestions list immediately for UI feedback
    setSuggestions((prev) => prev.filter((user) => user._id !== userId));

    // If the current page has no items after removal, go to previous page
    const updatedSuggestions = suggestions.filter(
      (user) => user._id !== userId
    );
    const updatedPages = Math.ceil(updatedSuggestions.length / itemsPerPage);
    if (currentPage >= updatedPages && currentPage > 0) {
      setCurrentPage(updatedPages - 1);
    }

    // Save the hidden suggestion to user's preferences
    if (currentUser?._id) {
      // Get the current hidden suggestions or initialize to empty array
      const currentHiddenSuggestions = Array.isArray(
        currentUser.hiddenSuggestions
      )
        ? [...currentUser.hiddenSuggestions]
        : [];

      const success = await hideSuggestion(
        currentUser._id,
        userId,
        currentHiddenSuggestions
      );

      if (success) {
        // Update the current user with the new hidden suggestions array for UI
        setCurrentUser((prev) => {
          if (!prev) return null;

          // Create new hiddenSuggestions array with the new ID
          const updatedHiddenSuggestions = [
            ...(prev.hiddenSuggestions || []),
            userId,
          ];

          // Return updated user object
          return {
            ...prev,
            hiddenSuggestions: updatedHiddenSuggestions,
          };
        });
      }
    }
  };

  // Function to force refresh suggestions
  const refreshSuggestions = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Function to refresh with new batch of suggestions (increment skip)
  const refreshWithNewBatch = () => {
    setSkip((prev) => prev + limit);
    setCurrentPage(0); // Reset to first page when getting new batch
  };

  // Navigation functions
  const goNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    } else {
      setCurrentPage(0);
    }
  };

  const goPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    } else {
      setCurrentPage(totalPages - 1);
    }
  };

  // Get visible suggestions for the current page
  const visibleSuggestions = suggestions.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return {
    suggestions,
    suggestionsApproach,
    nameFilterFallback,
    visibleSuggestions,
    isLoading,
    isUserFan,
    currentPage,
    totalPages,
    handleRemoveSuggestion,
    goNextPage,
    goPrevPage,
    setCurrentPage,
    currentUser,
    refreshSuggestions,
    refreshWithNewBatch,
    // Calculate empty slots needed to maintain consistent height
    fillerSlots: Array(
      Math.max(0, itemsPerPage - visibleSuggestions.length)
    ).fill(null),
  };
}
