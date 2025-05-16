"use server";

import { getAll } from "./crud";

/**
 * Get a list of suggested user profiles
 * @param {number} limit - Number of users to return
 * @returns {Array} - Array of user profiles
 */
export const getSuggestedUsers = async (limit = 5) => {
  try {
    // Fetch users with profile images
    const users = await getAll({
      col: "users",
      data: {
        // Only get users with profile images
        profileImage: { $ne: "" },
      },
      limit,
      // Randomize the order
      sort: { _id: 1 },
    });

    // Return just the needed fields for the suggestions component
    return users.map((user) => ({
      _id: user._id,
      name: user.name,
      username: user.name?.toLowerCase().replace(/\s+/g, "") || "", // Create a username if not present
      profileImage: user.profileImage,
      coverImage: user.coverImage || "", // Include cover image for background
      isAvailable: user.isAvailable,
      subscriptionPrice: user.subscriptionPrice,
    }));
  } catch (error) {
    console.error("Error fetching suggested users:", error);
    return [];
  }
};
