"use client";

import { useState, useEffect } from "react";
import { getSuggestedUsers } from "@/lib/actions/getSuggestedUsers";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import { hideSuggestion } from "@/lib/utils/suggestions/hideSuggestion";

/**
 * Custom hook for managing user suggestions
 *
 * @param {number} limit - Maximum number of suggestions to fetch
 * @param {number} itemsPerPage - Number of suggestions to show per page
 * @returns {Object} Suggestions state and management functions
 */
export function useSuggestions(limit = 10, itemsPerPage = 3) {
  const [suggestions, setSuggestions] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isUserFan, setIsUserFan] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const totalPages = Math.ceil((suggestions.length || 0) / itemsPerPage);

  // Fetch current user and suggestions
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Get current user to check if they're a fan
        const { mongoUser } = await getMongoUser();
        setCurrentUser(mongoUser);
        const isFan = mongoUser?.profileType === "fan";
        setIsUserFan(isFan);

        // Only fetch suggestions if user is a fan
        if (isFan) {
          const users = await getSuggestedUsers(limit);
          setSuggestions(users);
        }
      } catch (error) {
        console.error("Error fetching user or suggestions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [limit, refreshTrigger]);

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
    // Calculate empty slots needed to maintain consistent height
    fillerSlots: Array(
      Math.max(0, itemsPerPage - visibleSuggestions.length)
    ).fill(null),
  };
}
