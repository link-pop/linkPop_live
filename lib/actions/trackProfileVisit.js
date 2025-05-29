"use server";

import { getOne } from "./crud";
import { updateVisitedCreatorTags } from "./updateVisitedCreatorTags";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import { getMostFrequentCreatorTags } from "@/lib/utils/getMostFrequentCreatorTags";

/**
 * Track when a user visits another user's profile and update visitor's lastVisitedCreatorsTags
 * @param {string} visitedUserId - ID of the user being visited
 * @returns {Promise<Object>} Result of the operation
 */
export const trackProfileVisit = async (visitedUserId) => {
  if (!visitedUserId) {
    return { error: "Visited user ID is required" };
  }

  try {
    // Get current user
    const { mongoUser } = await getMongoUser();

    if (!mongoUser?._id) {
      return { error: "User not authenticated" };
    }

    // Don't track self-visits
    if (mongoUser._id.toString() === visitedUserId.toString()) {
      return { success: true, message: "Self-visit, no tracking needed" };
    }

    // Get the visited user's data
    const visitedUser = await getOne({
      col: "users",
      data: { _id: visitedUserId },
    });

    if (!visitedUser) {
      return { error: "Visited user not found" };
    }

    // Only track visits to creators with uploaded creator tags
    if (
      visitedUser.profileType !== "creator" ||
      !visitedUser.lastUploadedCreatorTags
    ) {
      return { success: true, message: "No creator tags to track" };
    }

    // Extract the most frequent tag from each category of the visited user's lastUploadedCreatorTags
    const visitedUserTags = visitedUser.lastUploadedCreatorTags;

    console.log("🔍 Visited user's lastUploadedCreatorTags:", visitedUserTags);

    // Get most frequent tags from each category
    const mostFrequentTags = getMostFrequentCreatorTags(visitedUserTags);

    console.log("🎯 Most frequent tags selected:", mostFrequentTags);

    const creatorTagsToAdd = {
      raceEthnicity: mostFrequentTags.raceEthnicity
        ? [mostFrequentTags.raceEthnicity]
        : [],
      hairColor: mostFrequentTags.hairColor ? [mostFrequentTags.hairColor] : [],
      bodyType: mostFrequentTags.bodyType ? [mostFrequentTags.bodyType] : [],
    };

    // Only update if we have at least one tag to add
    const hasAnyTags =
      creatorTagsToAdd.raceEthnicity.length > 0 ||
      creatorTagsToAdd.hairColor.length > 0 ||
      creatorTagsToAdd.bodyType.length > 0;

    if (!hasAnyTags) {
      return { success: true, message: "No tags to add" };
    }

    console.log(
      `👤 Tracking visit: ${mongoUser.name} visited ${visitedUser.name}`
    );
    console.log("➕ Adding creator tags to visitor:", creatorTagsToAdd);

    // Update the visitor's lastVisitedCreatorsTags
    const result = await updateVisitedCreatorTags({
      userId: mongoUser._id,
      creatorTags: creatorTagsToAdd,
    });

    if (result.error) {
      console.error("❌ Failed to update visited creator tags:", result.error);
      return { error: result.error };
    }

    console.log("✅ Successfully updated visited creator tags");
    return {
      success: true,
      message: "Profile visit tracked successfully",
      addedTags: creatorTagsToAdd,
    };
  } catch (error) {
    console.error("💥 Error tracking profile visit:", error);
    return { error: error.message || "Failed to track profile visit" };
  }
};
