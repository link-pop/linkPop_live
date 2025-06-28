"use server";

import { getAll } from "./crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import mongoose from "mongoose";

// * Server action to search chatrooms by participant name, username, or displayName
export const searchChatrooms = async (searchQuery) => {
  console.log("🔍 searchChatrooms - Called with query:", searchQuery);

  try {
    const { mongoUser } = await getMongoUser();
    if (!mongoUser) {
      throw new Error("User not authenticated");
    }

    console.log("🔍 searchChatrooms - mongoUser ID:", mongoUser._id);

    if (
      !searchQuery ||
      typeof searchQuery !== "string" ||
      searchQuery.trim().length === 0
    ) {
      console.log(
        "🔍 searchChatrooms - No search query, returning all user chatrooms"
      );
      // Return all user's chatrooms if no search query
      return {
        chatRoomUsers: mongoUser._id,
      };
    }

    const trimmedQuery = searchQuery.trim();
    console.log("🔍 searchChatrooms - Trimmed query:", trimmedQuery);

    // First, find users that match the search criteria
    const matchingUsers = await getAll({
      col: "users",
      data: {
        $or: [
          { name: { $regex: trimmedQuery, $options: "i" } },
          { username: { $regex: trimmedQuery, $options: "i" } },
          { displayName: { $regex: trimmedQuery, $options: "i" } },
        ],
      },
    });

    console.log(
      "🔍 searchChatrooms - Found matching users:",
      matchingUsers?.length || 0
    );
    console.log(
      "🔍 searchChatrooms - Matching users details:",
      matchingUsers?.map((u) => ({
        _id: u._id,
        name: u.name,
        username: u.username,
        displayName: u.displayName,
      }))
    );

    if (!matchingUsers || matchingUsers.length === 0) {
      console.log("🔍 searchChatrooms - No matching users found");
      // No matching users found, return filter that will match no chatrooms
      return {
        _id: "no-chatrooms-found",
      };
    }

    // Extract user IDs from matching users
    const matchingUserIds = matchingUsers.map((user) =>
      typeof user._id === "string"
        ? new mongoose.Types.ObjectId(user._id)
        : user._id
    );

    console.log("🔍 searchChatrooms - Matching user IDs:", matchingUserIds);

    // Return filter for chatrooms that:
    // 1. Include the current user (mongoUser._id)
    // 2. Include at least one of the matching users
    const searchFilter = {
      $and: [
        { chatRoomUsers: mongoUser._id }, // Current user must be in the chatroom
        { chatRoomUsers: { $in: matchingUserIds } }, // At least one matching user must be in the chatroom
      ],
    };

    console.log(
      "🔍 searchChatrooms - Final search filter:",
      JSON.stringify(searchFilter, null, 2)
    );
    return searchFilter;
  } catch (error) {
    console.error("❌ Error searching chatrooms:", error);
    throw new Error("Failed to search chatrooms");
  }
};
