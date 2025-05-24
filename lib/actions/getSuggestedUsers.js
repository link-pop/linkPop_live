"use server";

import { getAll, getOne } from "./crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";

/**
 * Get a list of suggested user profiles based on user preferences
 * @param {number} limit - Number of users to return
 * @returns {Array} - Array of user profiles
 */
export const getSuggestedUsers = async (limit = 15) => {
  try {
    // Get current user to check preferences
    const { mongoUser } = await getMongoUser();

    // Initialize query filters
    let filters = {
      // Only get users with profile images
      profileImage: { $ne: "" },
    };

    // If user has hidden suggestions, exclude them
    if (
      mongoUser?.hiddenSuggestions &&
      mongoUser.hiddenSuggestions.length > 0
    ) {
      filters._id = { $nin: mongoUser.hiddenSuggestions };
    }

    // Only apply preference filtering for 'fan' profiles
    if (mongoUser?.profileType === "fan") {
      // Build query based on user preferences
      // We'll look for creators that match the fan's preferences
      const preferenceFilters = {};

      // Age preference - use only if the fan has set a preferred age
      if (mongoUser?.preferAge) {
        // Allow a range of +/- 5 years from the preferred age
        // This filters creators based on their actual age, not their preferences
        const ageMin = Math.max(18, Number(mongoUser.preferAge) - 5);
        const ageMax = Number(mongoUser.preferAge) + 5;
        preferenceFilters.age = { $gte: ageMin, $lte: ageMax };
      }

      // Hair color preference - only if set and not "other" or "any"
      if (
        mongoUser?.hairColor &&
        !["any", "other"].includes(mongoUser.hairColor.toLowerCase())
      ) {
        preferenceFilters.hairColor = mongoUser.hairColor;
      }

      // Body type preference - only if set and not "other" or "any"
      if (
        mongoUser?.bodyType &&
        !["any", "other"].includes(mongoUser.bodyType.toLowerCase())
      ) {
        preferenceFilters.bodyType = mongoUser.bodyType;
      }

      // Only apply filters for creator profiles
      filters = {
        ...filters,
        ...preferenceFilters,
        profileType: "creator", // Only suggest creators to fans
      };

      // Get users that the current user is subscribed to
      const subscriptions = await getAll({
        col: "subscriptions",
        data: {
          createdBy: mongoUser._id,
          active: true,
        },
      });

      // Extract the IDs of users that the current user is subscribed to
      const subscribedToIds = subscriptions.map((sub) => sub.subscribedTo);

      // Exclude users that the current user is already subscribed to
      if (subscribedToIds.length > 0) {
        filters._id = {
          ...filters._id,
          $nin: [...(filters._id?.$nin || []), ...subscribedToIds],
        };
      }
    }

    // Fetch users with our filters
    const users = await getAll({
      col: "users",
      data: filters,
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
      // Include these attributes for UI filtering/display if needed
      age: user.age, // Actual age of the creator for display
      hairColor: user.hairColor,
      bodyType: user.bodyType,
    }));
  } catch (error) {
    console.error("Error fetching suggested users:", error);
    return [];
  }
};
