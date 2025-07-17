"use server";

import { getAll } from "./crud";
import mongoose from "mongoose";

/**
 * Get all attachments from a specific chat room
 * @param {string} chatId - The chat room ID
 * @param {Object} filters - Additional filters (fileType, etc.)
 * @param {Object} mongoUser - Current user
 * @returns {Array} Array of attachments from the chat
 */
export async function getChatAttachments(chatId, filters = {}, mongoUser) {
  if (!chatId || !mongoUser) {
    return [];
  }

  try {
    // First, get all messages from this chat room
    const chatMessages = await getAll({
      col: "chatmessages",
      data: {
        chatRoomId: chatId,
      },
    });

    if (!chatMessages || chatMessages.length === 0) {
      return [];
    }

    // Extract message IDs
    const messageIds = chatMessages.map((message) =>
      message._id instanceof mongoose.Types.ObjectId
        ? message._id
        : new mongoose.Types.ObjectId(message._id)
    );

    // Now get all attachments related to these messages
    const attachmentQuery = {
      relatedPostId: { $in: messageIds },
      uploadedFrom: "chatmessages",
    };

    // Apply additional filters
    if (filters.fileType) {
      attachmentQuery.fileType = filters.fileType;
    }

    if (filters.fileUrl_contains) {
      attachmentQuery.fileUrl = {
        $regex: filters.fileUrl_contains,
        $options: "i",
      };
    }

    if (filters.fileUrl_not_contains) {
      attachmentQuery.fileUrl = {
        $not: { $regex: filters.fileUrl_not_contains, $options: "i" },
      };
    }

    if (filters.tags && filters.tags.length > 0) {
      attachmentQuery.tags = { $in: filters.tags };
    }

    const attachments = await getAll({
      col: "attachments",
      data: attachmentQuery,
      sort: { createdAt: -1 }, // Most recent first
    });

    return attachments || [];
  } catch (error) {
    console.error("❌ Error getting chat attachments:", error);
    return [];
  }
}
