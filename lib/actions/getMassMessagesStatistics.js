"use server";

import { getAll } from "./crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import mongoose from "mongoose";

// * Server action to get mass messages statistics for the current user
export const getMassMessagesStatistics = async ({
  limit = 20,
  skip = 0,
  messageType = "all",
  searchQuery = "",
}) => {
  try {
    const { mongoUser } = await getMongoUser();
    if (!mongoUser) {
      throw new Error("User not authenticated");
    }

    console.log(
      "🔍 Fetching mass messages statistics for user:",
      mongoUser._id,
      "with search query:",
      searchQuery
    );

    // Build the query data for messages
    let queryData = {
      createdBy: mongoUser._id,
      $or: [
        { chatMsgText: { $ne: "" } }, // Messages with text
        { files: { $exists: true, $ne: [] } }, // Messages with files
      ],
    };

    // Add search filter if provided
    if (searchQuery && searchQuery.trim()) {
      const trimmedQuery = searchQuery.trim();
      // Escape special regex characters to prevent regex injection
      const escapedQuery = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      queryData.chatMsgText = { $regex: escapedQuery, $options: "i" };
    }

    // Get all messages sent by this user to different chatrooms
    // We'll group by chatMsgText and files to identify mass messages
    const messages = await getAll({
      col: "chatmessages",
      data: queryData,
      sort: { createdAt: -1 },
      limit: limit * 10, // Get more to account for grouping
      skip,
    });

    console.log("📊 Found total messages:", messages.length);

    // Group messages by content (text + files) to identify mass messages
    // We'll look for messages sent within a short time window with identical content
    const messageGroups = new Map();
    const now = new Date();

    messages.forEach((message) => {
      // Create a key based on message content and files
      const filesKey = message.files
        ? JSON.stringify(
            message.files
              .map((f) => ({
                fileUrl: f.fileUrl,
                fileName: f.fileName,
                fileType: f.fileType,
              }))
              .sort()
          )
        : "[]";

      const contentKey = `${message.chatMsgText || ""}__${filesKey}__${
        message.price || 0
      }`;

      if (!messageGroups.has(contentKey)) {
        messageGroups.set(contentKey, {
          messages: [],
          firstMessage: message,
          isScheduled: false,
          hasFiles: false,
          hasPrice: false,
          content: {
            text: message.chatMsgText,
            files: message.files || [],
            price: message.price || null,
            createdAt: message.createdAt,
          },
        });
      }

      const group = messageGroups.get(contentKey);
      group.messages.push(message);

      // Mark as scheduled if any message in the group has scheduleAt > now
      if (message.scheduleAt && new Date(message.scheduleAt) > now) {
        group.isScheduled = true;
      }

      // Mark if group has files
      if (message.files && message.files.length > 0) {
        group.hasFiles = true;
      }

      // Mark if group has price
      if (message.price && message.price > 0) {
        group.hasPrice = true;
      }
    });

    // Get all purchases for hasPurchases filter check
    let purchasedMessageIds = new Set();
    if (messageType === "hasPurchases" || messageType === "all") {
      try {
        const allPurchases = await getAll({
          col: "purchases",
          data: {
            postType: "chatmessages",
            status: "completed",
          },
        });
        purchasedMessageIds = new Set(
          allPurchases.map((purchase) => String(purchase.postId))
        );
      } catch (error) {
        console.error("❌ Error fetching purchases for filter:", error);
      }
    }

    // Filter to only show groups with multiple messages (indicating mass messages)
    const massMessageGroupsArray = [];

    for (const [key, group] of messageGroups.entries()) {
      if (group.messages.length <= 1) continue; // Skip single messages

      // Check if any message in this group has been purchased
      const groupHasPurchases = group.messages.some((message) =>
        purchasedMessageIds.has(String(message._id))
      );

      // Apply message type filter
      if (messageType === "sent" && group.isScheduled) continue;
      if (messageType === "scheduled" && !group.isScheduled) continue;
      if (messageType === "hasFiles" && !group.hasFiles) continue;
      if (messageType === "hasPrice" && !group.hasPrice) continue;
      if (messageType === "hasPurchases" && !groupHasPurchases) continue;

      const messages = group.messages;
      const totalSent = messages.length;
      const messageIds = messages.map((msg) => msg._id);

      // Calculate real "viewed" statistics based on chatMsgStatus
      const viewedMessages = messages.filter(
        (msg) => msg.chatMsgStatus === "read"
      );
      const viewed = viewedMessages.length;

      // Calculate real "purchased" statistics if messages have a price
      let purchased = 0;
      if (group.content.price && group.content.price > 0) {
        try {
          const purchases = await getAll({
            col: "purchases",
            data: {
              postId: { $in: messageIds },
              postType: "chatmessages",
              status: "completed",
            },
          });
          purchased = purchases ? purchases.length : 0;
        } catch (error) {
          console.error("❌ Error fetching purchases for messages:", error);
          purchased = 0;
        }
      }

      massMessageGroupsArray.push({
        id: key,
        dateTime: group.content.createdAt,
        text: group.content.text,
        files: group.content.files,
        price: group.content.price,
        sent: totalSent,
        viewed: viewed,
        purchased: purchased,
        messages: messages,
      });
    }

    // Sort by date and limit results
    const sortedGroups = massMessageGroupsArray
      .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))
      .slice(0, limit);

    console.log("📈 Mass message groups found:", sortedGroups.length);

    return {
      success: true,
      massMessages: sortedGroups,
      total: sortedGroups.length,
    };
  } catch (error) {
    console.error("❌ Error fetching mass messages statistics:", error);
    return {
      success: false,
      error: error.message,
      massMessages: [],
      total: 0,
    };
  }
};
