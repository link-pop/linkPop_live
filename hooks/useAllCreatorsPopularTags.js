"use client";

import { useState, useEffect } from "react";
import { getAllCreatorsPopularTags } from "@/lib/actions/getAllCreatorsPopularTags";

/**
 * Custom hook to fetch popular tags from all creators
 * @param {number} limit - Maximum number of tags to return (default: 50)
 * @returns {Object} { tags: Array, isLoading: boolean, error: string|null }
 */
export function useAllCreatorsPopularTags(limit = 50) {
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTags = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const popularTags = await getAllCreatorsPopularTags(limit);
        setTags(popularTags || []);
      } catch (err) {
        console.error("Error fetching all creators popular tags:", err);
        setError(err.message || "Failed to fetch popular tags");
        setTags([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTags();
  }, [limit]);

  return {
    tags,
    isLoading,
    error,
  };
}
