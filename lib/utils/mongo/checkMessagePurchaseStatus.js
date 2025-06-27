import { getAll } from "@/lib/actions/crud";
import mongoose from "mongoose";

/**
 * Check if any of the given message IDs have been purchased
 * @param {Array} messageIds - Array of message IDs to check
 * @returns {Object} Object with messageId as key and boolean as value indicating if purchased
 */
export const checkMessagePurchaseStatus = async (messageIds) => {
  if (!messageIds || messageIds.length === 0) {
    return {};
  }

  try {
    // Convert string IDs to ObjectIds for query
    const objectIds = messageIds.map((id) => new mongoose.Types.ObjectId(id));

    // Get all completed purchases for these message IDs
    const purchases = await getAll({
      col: "purchases",
      data: {
        postId: { $in: objectIds },
        postType: "chatmessages",
        status: "completed",
      },
    });

    // Create a lookup map of purchased message IDs
    const purchasedMessageIds = new Set();
    if (purchases && purchases.length > 0) {
      purchases.forEach((purchase) => {
        purchasedMessageIds.add(purchase.postId.toString());
      });
    }

    // Return a map of messageId -> boolean (purchased status)
    const purchaseStatusMap = {};
    messageIds.forEach((messageId) => {
      purchaseStatusMap[messageId] = purchasedMessageIds.has(messageId);
    });

    return purchaseStatusMap;
  } catch (error) {
    console.error("❌ Error checking message purchase status:", error);
    // Return empty object on error (fail safe - assume not purchased)
    return {};
  }
};
