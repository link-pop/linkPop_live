"use server";

import { getAll } from "./crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";

// * Server action to search users for mass messaging
export const searchUsers = async (searchQuery = "", limit = 20, skip = 0) => {
  try {
    const { mongoUser } = await getMongoUser();
    if (!mongoUser) {
      throw new Error("User not authenticated");
    }

    let searchFilter = {
      _id: { $ne: mongoUser._id }, // Exclude current user
      profileImage: { $ne: "" }, // Only users with profile images
    };

    // Add search query if provided
    if (searchQuery && searchQuery.trim().length > 0) {
      const trimmedQuery = searchQuery.trim();
      searchFilter.$or = [
        { name: { $regex: trimmedQuery, $options: "i" } },
        { username: { $regex: trimmedQuery, $options: "i" } },
        { displayName: { $regex: trimmedQuery, $options: "i" } },
      ];
    }

    const users = await getAll({
      col: "users",
      data: searchFilter,
      limit,
      skip,
      sort: { name: 1 }, // Sort alphabetically
    });

    // Return simplified user data for mass messaging
    return users.map((user) => ({
      _id: user._id,
      name: user.name,
      username: user.username || user.name?.toLowerCase().replace(/\s+/g, ""),
      displayName: user.displayName,
      profileImage: user.profileImage,
      isAvailable: user.isAvailable,
    }));
  } catch (error) {
    console.error("❌ Error searching users:", error);
    throw new Error("Failed to search users");
  }
};
