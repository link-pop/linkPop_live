"use client";

import { useProfileVisitTracker } from "@/hooks/useProfileVisitTracker";

/**
 * Component to track user profile visits and update visitor's lastVisitedCreatorsTags
 * @param {Object} mongoUser - Current logged-in user
 * @param {Object} visitedMongoUser - User being visited
 */
export default function UserProfileVisitTracker({
  mongoUser,
  visitedMongoUser,
}) {
  // Use the custom hook to automatically track the visit
  useProfileVisitTracker(mongoUser, visitedMongoUser, {
    autoTrack: true,
    delay: 1000,
    onSuccess: (result) => {
      console.log("✅ Profile visit tracked successfully:", result.message);
    },
    onError: (error) => {
      console.error("❌ Failed to track profile visit:", error);
    },
  });

  // This component doesn't render anything
  return null;
}
