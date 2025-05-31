import { useEffect, useRef, useCallback } from "react";

/**
 * Custom hook for infinite scroll functionality
 *
 * @param {Function} loadMore - Function to call when more content should be loaded
 * @param {boolean} hasMore - Whether there's more content to load
 * @param {boolean} isLoading - Whether content is currently being loaded
 * @param {number} threshold - Distance from bottom to trigger load (default: 300px)
 * @returns {Object} - Ref to attach to the container element
 */
export function useInfiniteScroll(
  loadMore,
  hasMore,
  isLoading,
  threshold = 300
) {
  const containerRef = useRef(null);
  const isLoadingRef = useRef(false);

  // Update loading ref when isLoading changes
  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  const handleScroll = useCallback(() => {
    if (isLoadingRef.current || !hasMore) {
      return;
    }

    // Check window scroll position
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;

    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    if (distanceFromBottom < threshold) {
      loadMore();
    }
  }, [loadMore, hasMore, threshold]);

  useEffect(() => {
    // Use window scroll for infinite scroll
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  return { containerRef };
}
