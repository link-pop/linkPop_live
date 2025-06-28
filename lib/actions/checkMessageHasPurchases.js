"use server";

import { getAll } from "./crud";
import mongoose from "mongoose";

/**
 * Server action to check if a chat message has any completed purchases
 * @param {string} messageId - The message ID to check
 * @returns {Promise<boolean>} - Whether the message has any purchases
 */
export async function checkMessageHasPurchases(messageId) {
  try {
    if (!messageId) {
      return false;
    }

    // Get all completed purchases for this message
    const purchases = await getAll({
      col: "purchases",
      data: {
        postId: new mongoose.Types.ObjectId(messageId),
        postType: "chatmessages",
        status: "completed",
      },
    });

    return purchases && purchases.length > 0;
  } catch (error) {
    console.error("❌ Error checking message purchases:", error);
    return false;
  }
}
