"use client";

import { useState, useCallback, useMemo } from "react";

/**
 * A custom hook for managing pagination
 *
 * @param {Array} items - The array of items to paginate
 * @param {number} itemsPerPage - Number of items to show per page
 * @param {number} minItemsToShow - Minimum number of items to maintain in the view (for UI consistency)
 */
export function usePagination(
  items = [],
  itemsPerPage = 10,
  minItemsToShow = 3
) {
  const [currentPage, setCurrentPage] = useState(0);

  // Calculate total pages based on item count and items per page
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(items.length / itemsPerPage));
  }, [items.length, itemsPerPage]);

  // Get visible items for the current page
  const visibleItems = useMemo(() => {
    const startIndex = currentPage * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  }, [items, currentPage, itemsPerPage]);

  // Calculate filler slots to maintain consistent height if less than minimum items
  const fillerSlots = useMemo(() => {
    if (visibleItems.length >= minItemsToShow) return [];
    return Array(minItemsToShow - visibleItems.length).fill(null);
  }, [visibleItems.length, minItemsToShow]);

  // Navigation functions
  const goNextPage = useCallback(() => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [currentPage, totalPages]);

  const goPrevPage = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [currentPage]);

  return {
    visibleItems,
    currentPage,
    totalPages,
    setCurrentPage,
    goNextPage,
    goPrevPage,
    fillerSlots,
  };
}
