"use client";

import { useEffect, useCallback } from "react";
import { trackProfileVisit } from "@/lib/actions/trackProfileVisit";

/**
 * Custom hook to track profile visits for the suggestion system
 * @param {Object} mongoUser - Current logged-in user
 * @param {Object} visitedMongoUser - User being visited
 * @param {Object} options - Configuration options
 * @returns {Function} Manual track function
 */
export const useProfileVisitTracker = (
  mongoUser,
  visitedMongoUser,
  options = {}
) => {
  const { autoTrack = true, delay = 1000, onSuccess, onError } = options;

  const trackVisit = useCallback(async () => {
    // Only track if we have both users and they're different people
    if (
      !mongoUser?._id ||
      !visitedMongoUser?._id ||
      mongoUser._id === visitedMongoUser._id
    ) {
      return { skipped: true, reason: "Same user or missing data" };
    }

    // Only track if the visited user is a creator
    if (visitedMongoUser.profileType !== "creator") {
      return { skipped: true, reason: "Not a creator profile" };
    }

    try {
      const result = await trackProfileVisit(visitedMongoUser._id);

      if (result.error) {
        console.error("Failed to track profile visit:", result.error);
        onError?.(result.error);
        return result;
      } else if (result.success) {
        console.log("Profile visit tracked:", result.message);
        if (result.addedTags) {
          console.log("Added creator tags:", result.addedTags);
        }
        onSuccess?.(result);
        return result;
      }
    } catch (error) {
      console.error("Error tracking profile visit:", error);
      onError?.(error);
      return { error: error.message };
    }
  }, [
    mongoUser?._id,
    visitedMongoUser?._id,
    visitedMongoUser?.profileType,
    onSuccess,
    onError,
  ]);

  useEffect(() => {
    if (!autoTrack) return;

    const timeoutId = setTimeout(trackVisit, delay);
    return () => clearTimeout(timeoutId);
  }, [autoTrack, delay, trackVisit]);

  return trackVisit;
};
