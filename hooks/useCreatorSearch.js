"use client";

import { useState, useCallback, useRef } from "react";
import { searchCreators } from "@/lib/actions/searchCreators";

/**
 * Custom hook for managing creator search functionality
 *
 * @param {number} resultsPerPage - Number of results to fetch per page (default: 20)
 * @returns {Object} Search state and management functions
 */
export function useCreatorSearch(resultsPerPage = 20) {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [approach, setApproach] = useState("none");
  const [nameFilterFallback, setNameFilterFallback] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const currentSkipRef = useRef(0);
  const [error, setError] = useState(null);
  const [lastSearchParams, setLastSearchParams] = useState({});

  // Perform search
  const performSearch = useCallback(
    async (searchParams, resetResults = true) => {
      // Only search if there are meaningful search parameters
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

      if (!hasMeaningfulParams) {
        // Clear results if no meaningful search parameters
        setResults([]);
        setApproach("none");
        setNameFilterFallback(false);
        setTotalCount(0);
        setHasMore(false);
        currentSkipRef.current = 0;
        setError(null);
        setLastSearchParams({});
        return { success: true, results: [] };
      }

      setIsLoading(true);
      setError(null);

      if (resetResults) {
        currentSkipRef.current = 0;
        setLastSearchParams(searchParams);
      }

      const skip = resetResults ? 0 : currentSkipRef.current;

      try {
        const result = await searchCreators(searchParams, resultsPerPage, skip);

        if (result.error) {
          setError(result.error);
          if (resetResults) {
            setResults([]);
          }
          return { success: false, error: result.error };
        } else {
          const newResults = result.users || [];

          if (resetResults) {
            setResults(newResults);
          } else {
            setResults((prev) => [...prev, ...newResults]);
          }

          setApproach(result.approach || "none");
          setNameFilterFallback(result.nameFilterFallback || false);
          setTotalCount(result.totalCount || 0);
          setHasMore(result.hasMore || false);

          if (!resetResults) {
            currentSkipRef.current = skip + resultsPerPage;
          }

          return { success: true, results: newResults };
        }
      } catch (error) {
        console.error("Search error:", error);
        setError(error.message);
        if (resetResults) {
          setResults([]);
        }
        return { success: false, error: error.message };
      } finally {
        setIsLoading(false);
      }
    },
    [resultsPerPage]
  );

  // Load more results
  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore || !lastSearchParams) return;

    return await performSearch(lastSearchParams, false);
  }, [isLoading, hasMore, lastSearchParams, performSearch]);

  // Remove a result from the list (for hiding functionality)
  const removeResult = useCallback((userId) => {
    setResults((prev) => prev.filter((user) => user._id !== userId));
  }, []);

  // Clear all search data
  const clearSearch = useCallback(() => {
    setResults([]);
    setApproach("none");
    setNameFilterFallback(false);
    setTotalCount(0);
    setHasMore(false);
    currentSkipRef.current = 0;
    setError(null);
    setLastSearchParams({});
  }, []);

  return {
    // State
    results,
    isLoading,
    approach,
    nameFilterFallback,
    totalCount,
    hasMore,
    error,

    // Actions
    performSearch,
    loadMore,
    removeResult,
    clearSearch,

    // Computed values
    hasResults: results.length > 0,
    hasSearchParams: Object.entries(lastSearchParams).some(([key, value]) => {
      // Don't count showPaidOnly as a search parameter since it's just a filter
      if (
        key === "showPaidOnly" ||
        key === "displayAllUsersIfNoMatchFoundForSuggestions"
      ) {
        return false;
      }
      return value !== "" && value !== false;
    }),
  };
}
