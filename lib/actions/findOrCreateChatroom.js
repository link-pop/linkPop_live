"use server";

import { getOne, add } from "./crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import mongoose from "mongoose";

// * Server action to find or create a chatroom between two users
export const findOrCreateChatroom = async (otherUserId) => {
  console.log(
    "🔍 findOrCreateChatroom - Called with otherUserId:",
    otherUserId
  );

  try {
    const { mongoUser } = await getMongoUser();
    if (!mongoUser) {
      throw new Error("User not authenticated");
    }

    console.log("🔍 findOrCreateChatroom - mongoUser ID:", mongoUser._id);

    // Check if chatroom already exists between the two users
    const existingChatroom = await getOne({
      col: "chatrooms",
      data: {
        chatRoomUsers: {
          $all: [
            new mongoose.Types.ObjectId(mongoUser._id),
            new mongoose.Types.ObjectId(otherUserId),
          ],
        },
        $expr: { $eq: [{ $size: "$chatRoomUsers" }, 2] }, // Ensure it's a 1-on-1 chat
      },
    });

    if (existingChatroom) {
      console.log(
        "🔍 findOrCreateChatroom - Found existing chatroom:",
        existingChatroom._id
      );
      return existingChatroom._id.toString();
    }

    // Create new chatroom if it doesn't exist
    console.log("🔍 findOrCreateChatroom - Creating new chatroom");
    const newChatroom = await add({
      col: "chatrooms",
      data: {
        chatRoomUsers: [
          new mongoose.Types.ObjectId(mongoUser._id),
          new mongoose.Types.ObjectId(otherUserId),
        ],
      },
    });

    console.log(
      "🔍 findOrCreateChatroom - Created new chatroom:",
      newChatroom._id
    );
    return newChatroom._id.toString();
  } catch (error) {
    console.error("❌ Error finding or creating chatroom:", error);
    throw new Error("Failed to find or create chatroom");
  }
};
