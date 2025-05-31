"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "searchCreatorParams";

/**
 * Custom hook for managing search parameters with localStorage memory
 *
 * @param {Object} defaultParams - Default search parameters
 * @returns {Object} Search parameters state and management functions
 */
export function useSearchParamsMemory(defaultParams = {}) {
  const [searchParams, setSearchParams] = useState(defaultParams);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load search parameters from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedParams = JSON.parse(stored);
        setSearchParams({ ...defaultParams, ...parsedParams });
      }
    } catch (error) {
      console.error("Failed to load search params from localStorage:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save search parameters to localStorage whenever they change
  useEffect(() => {
    if (!isLoaded) return; // Don't save until we've loaded from storage

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(searchParams));
    } catch (error) {
      console.error("Failed to save search params to localStorage:", error);
    }
  }, [searchParams, isLoaded]);

  // Update search parameters
  const updateSearchParams = useCallback((updates) => {
    setSearchParams((prev) => ({ ...prev, ...updates }));
  }, []);

  // Clear search parameters
  const clearSearchParams = useCallback(() => {
    setSearchParams(defaultParams);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear search params from localStorage:", error);
    }
  }, [defaultParams]);

  return {
    searchParams,
    updateSearchParams,
    clearSearchParams,
    isLoaded,
  };
}
