"use server";

import { getAllPostsOwner } from "./getAllPostsOwner";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import mongoose from "mongoose";

// * Server action to search chat messages within a specific chat room
export const searchChatMessages = async ({
  chatRoomId,
  searchQuery,
  limit = 100,
  skip = 0,
}) => {
  try {
    const { mongoUser } = await getMongoUser();
    if (!mongoUser) {
      throw new Error("User not authenticated");
    }

    if (!chatRoomId) {
      throw new Error("Chat room ID is required");
    }

    console.log(
      "🔍 Searching chat messages in room:",
      chatRoomId,
      "with query:",
      searchQuery
    );

    let searchData = {
      chatRoomId: chatRoomId,
    };

    // Add search filter if provided
    if (searchQuery && searchQuery.trim()) {
      const trimmedQuery = searchQuery.trim();
      // Escape special regex characters to prevent regex injection
      const escapedQuery = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      searchData.chatMsgText = { $regex: escapedQuery, $options: "i" };
    }

    const now = new Date();

    // Use the same logic as MessagesInfiniteScroll to get messages
    const messages = await getAllPostsOwner({
      col: { name: "chatmessages" },
      data: {
        ...searchData,
        $or: [
          // * User's own messages - show all (including scheduled)
          {
            $and: [{ createdBy: mongoUser._id }, { active: { $ne: false } }],
          },
          // * Other's messages - only show non-scheduled and non-expired
          {
            $and: [
              { createdBy: { $ne: mongoUser._id } },
              { active: { $ne: false } },
              // * Schedule filter - only show if not scheduled or schedule time passed
              {
                $or: [
                  { scheduleAt: { $exists: false } },
                  { scheduleAt: null },
                  { scheduleAt: { $lte: now } },
                ],
              },
            ],
          },
        ],
      },
      mongoUser,
      limit,
      skip,
      sort: { createdAt: -1 },
    });

    console.log("📊 Found", messages.length, "matching messages");
    return messages;
  } catch (error) {
    console.error("❌ Error searching chat messages:", error);
    throw new Error("Failed to search chat messages");
  }
};
