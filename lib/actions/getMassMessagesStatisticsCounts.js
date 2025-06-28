"use server";

import { getAll } from "./crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";

export const dynamic = "force-dynamic";

// * Server action to get mass messages counts by type for filters
export const getMassMessagesStatisticsCounts = async () => {
  try {
    const { mongoUser } = await getMongoUser();
    if (!mongoUser) {
      throw new Error("User not authenticated");
    }

    console.log("🔍 Fetching mass messages counts for user:", mongoUser._id);

    // Get all messages sent by this user
    const allMessages = await getAll({
      col: "chatmessages",
      data: {
        createdBy: mongoUser._id,
        $or: [
          { chatMsgText: { $ne: "" } }, // Messages with text
          { files: { $exists: true, $ne: [] } }, // Messages with files
        ],
      },
    });

    if (!allMessages || allMessages.length === 0) {
      return {
        all: 0,
        sent: 0,
        scheduled: 0,
        hasFiles: 0,
        hasPrice: 0,
        hasPurchases: 0,
      };
    }

    // Group messages by content to identify mass messages
    const messageGroups = new Map();
    const now = new Date();

    allMessages.forEach((message) => {
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
          isScheduled: false,
          hasFiles: false,
          hasPrice: false,
          hasPurchases: false,
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

    // Get all purchases for hasPurchases check
    const allPurchases = await getAll({
      col: "purchases",
      data: {
        postType: "chatmessages",
        status: "completed",
      },
    });

    // Create a set of purchased message IDs for quick lookup
    const purchasedMessageIds = new Set(
      allPurchases.map((purchase) => String(purchase.postId))
    );

    // Filter to only count groups with multiple messages (mass messages)
    let totalMassMessageGroups = 0;
    let sentMassMessageGroups = 0;
    let scheduledMassMessageGroups = 0;
    let hasFilesMassMessageGroups = 0;
    let hasPriceMassMessageGroups = 0;
    let hasPurchasesMassMessageGroups = 0;

    for (const [key, group] of messageGroups.entries()) {
      if (group.messages.length <= 1) continue; // Skip single messages

      // Check if any message in this group has been purchased
      const groupHasPurchases = group.messages.some((message) =>
        purchasedMessageIds.has(String(message._id))
      );

      totalMassMessageGroups++;

      if (group.isScheduled) {
        scheduledMassMessageGroups++;
      } else {
        sentMassMessageGroups++;
      }

      if (group.hasFiles) {
        hasFilesMassMessageGroups++;
      }

      if (group.hasPrice) {
        hasPriceMassMessageGroups++;
      }

      if (groupHasPurchases) {
        hasPurchasesMassMessageGroups++;
      }
    }

    console.log("📊 Mass message counts:", {
      all: totalMassMessageGroups,
      sent: sentMassMessageGroups,
      scheduled: scheduledMassMessageGroups,
      hasFiles: hasFilesMassMessageGroups,
      hasPrice: hasPriceMassMessageGroups,
      hasPurchases: hasPurchasesMassMessageGroups,
    });

    return {
      all: totalMassMessageGroups,
      sent: sentMassMessageGroups,
      scheduled: scheduledMassMessageGroups,
      hasFiles: hasFilesMassMessageGroups,
      hasPrice: hasPriceMassMessageGroups,
      hasPurchases: hasPurchasesMassMessageGroups,
    };
  } catch (error) {
    console.error("❌ Error fetching mass messages counts:", error);
    return {
      all: 0,
      sent: 0,
      scheduled: 0,
      hasFiles: 0,
      hasPrice: 0,
      hasPurchases: 0,
    };
  }
};
