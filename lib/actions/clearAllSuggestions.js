"use server";

import { update } from "./crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";

/**
 * Clear all suggestion-related data for the current user
 * This includes:
 * - hiddenSuggestions: array of hidden user IDs
 * - lastVisitedCreatorsTags: tags from visited creators used for smart matching
 *
 * This effectively resets the suggestion algorithm to start fresh
 */
export const clearAllSuggestions = async () => {
  try {
    // Get current user
    const { mongoUser } = await getMongoUser();

    if (!mongoUser?._id) {
      return { error: "User not found" };
    }

    // Clear all suggestion-related data
    const result = await update({
      col: "users",
      data: { _id: mongoUser._id },
      update: {
        preferAge: null,
        raceEthnicity: null,
        hairColor: null,
        bodyType: null,
        hiddenSuggestions: [],
        lastVisitedCreatorsTags: {
          raceEthnicity: [],
          hairColor: [],
          bodyType: [],
        },
      },
      revalidate: ["/"],
    });

    if (result.error) {
      return { error: result.error };
    }

    return { success: true };
  } catch (error) {
    console.error("Error clearing all suggestions:", error);
    return { error: "Failed to clear suggestions data" };
  }
};
