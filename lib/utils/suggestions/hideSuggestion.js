"use server";

import { update } from "@/lib/actions/crud";

/**
 * Adds a user ID to the current user's hidden suggestions list
 * This will prevent the hidden user from appearing in future suggestions
 *
 * @param {string} currentUserId - The ID of the current user
 * @param {string} userIdToHide - The ID of the user to hide from suggestions
 * @param {Array} currentHiddenSuggestions - The current list of hidden suggestions
 * @returns {Promise<Boolean>} - Success status of the operation
 */
export const hideSuggestion = async (
  currentUserId,
  userIdToHide,
  currentHiddenSuggestions = []
) => {
  if (!currentUserId || !userIdToHide) {
    console.error("Missing required parameters to hide suggestion");
    return false;
  }

  try {
    // Ensure the current hidden suggestions is an array
    const existingHiddenSuggestions = Array.isArray(currentHiddenSuggestions)
      ? currentHiddenSuggestions
      : [];

    // Skip if already hidden
    if (existingHiddenSuggestions.includes(userIdToHide)) {
      return true;
    }

    // Create updated list with the new hidden user ID
    const updatedHiddenSuggestions = [
      ...existingHiddenSuggestions,
      userIdToHide,
    ];

    // Update the user's preferences
    await update({
      col: "users",
      data: { _id: currentUserId },
      update: {
        hiddenSuggestions: updatedHiddenSuggestions,
      },
      revalidate: ["/"], // Ensure the homepage gets revalidated
    });

    return true;
  } catch (error) {
    console.error("Failed to update hidden suggestions:", error);
    return false;
  }
};
