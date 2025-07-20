"use server";

import { getOne, update } from "./crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import { getLastUserProfileImages } from "@/lib/utils/mongo/getLastUserProfileImages";

export async function addUsersToUserList(listId, userIds) {
  try {
    const { mongoUser } = await getMongoUser();

    if (!mongoUser?._id) {
      return { error: "User not authenticated" };
    }

    if (!listId || !Array.isArray(userIds) || userIds.length === 0) {
      return { error: "Invalid list ID or user IDs" };
    }

    // Get current list to check existing userIds
    const currentList = await getOne({
      col: "userlists",
      data: { _id: listId },
    });

    if (!currentList || currentList.error) {
      return { error: "List not found" };
    }

    // Ensure we properly extract and convert user IDs to strings
    const userIdsToProcess = userIds
      .map((id) => {
        // Handle different input formats
        if (typeof id === "object" && id._id) {
          return id._id.toString();
        } else if (typeof id === "string") {
          return id;
        } else if (id && id.toString) {
          return id.toString();
        }
        return null;
      })
      .filter(Boolean); // Remove any null values

    // Get existing user IDs as strings for comparison
    const existingUserIds = (currentList.userIds || [])
      .map((id) => {
        if (typeof id === "object" && id._id) {
          return id._id.toString();
        } else if (typeof id === "string") {
          return id;
        } else if (id && id.toString) {
          return id.toString();
        }
        return null;
      })
      .filter(Boolean);

    // Separate users to add and remove
    const usersToAdd = [];
    const usersToRemove = [];

    userIdsToProcess.forEach((userId) => {
      if (existingUserIds.includes(userId)) {
        usersToRemove.push(userId);
      } else {
        usersToAdd.push(userId);
      }
    });

    // Create new user IDs array
    let newUserIds = [...existingUserIds];

    // Remove users that are already in the list
    if (usersToRemove.length > 0) {
      newUserIds = newUserIds.filter((id) => !usersToRemove.includes(id));
    }

    // Add new users
    if (usersToAdd.length > 0) {
      newUserIds.push(...usersToAdd);
    }

    // Remove duplicates just in case
    newUserIds = [...new Set(newUserIds)];

    // Get the last 3 user profile images for preview
    const lastUserProfileImages = await getLastUserProfileImages(newUserIds);

    // Update the list with new user IDs and lastUserProfileImages
    const result = await update({
      col: "userlists",
      data: { _id: listId },
      update: {
        userIds: newUserIds,
        lastUserProfileImages: lastUserProfileImages,
        updatedAt: new Date(),
      },
      skipOwnershipCheck: true, // We already checked ownership above
    });

    if (result.error) {
      return { error: result.error };
    }

    return {
      success: true,
      addedCount: usersToAdd.length,
      removedCount: usersToRemove.length,
      totalCount: newUserIds.length,
      action: usersToAdd.length > 0 ? "added" : "removed",
      list: result,
    };
  } catch (error) {
    console.error("❌ Error adding users to user list:", error);
    return { error: error.message || "Failed to add users to list" };
  }
}
