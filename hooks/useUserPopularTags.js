"use client";

import { useState, useEffect } from "react";
import { getUserPopularTags } from "@/lib/actions/getUserPopularTags";

/**
 * Custom hook to fetch popular tags for a user
 * @param {string} userId - The user's MongoDB ID
 * @param {number} limit - Maximum number of tags to return (default: 50)
 * @returns {Object} { tags: Array, isLoading: boolean, error: string|null }
 */
export function useUserPopularTags(userId, limit = 50) {
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setTags([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    const fetchTags = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const popularTags = await getUserPopularTags(userId, limit);
        setTags(popularTags || []);
      } catch (err) {
        console.error("Error fetching popular tags:", err);
        setError(err.message || "Failed to fetch popular tags");
        setTags([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTags();
  }, [userId, limit]);

  return {
    tags,
    isLoading,
    error,
  };
}
