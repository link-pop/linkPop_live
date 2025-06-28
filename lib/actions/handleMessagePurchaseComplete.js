"use server";

import { getOne } from "./crud";
import { createMessagePurchaseNotification } from "@/lib/utils/notifications/createMessagePurchaseNotification";
import mongoose from "mongoose";

/**
 * Server action to handle completed message purchase
 * Creates notification and updates chatroom
 * @param {string} messageId - The purchased message ID
 * @param {string} buyerId - The buyer's user ID
 * @param {number} amount - The purchase amount
 */
export async function handleMessagePurchaseComplete({
  messageId,
  buyerId,
  amount,
}) {
  try {
    console.log(
      `🛒 Processing message purchase completion for message ${messageId}`
    );

    if (!messageId || !buyerId || !amount) {
      throw new Error("Missing required parameters");
    }

    // Get the message details to find the seller and chatroom
    const message = await getOne({
      col: "chatmessages",
      data: { _id: new mongoose.Types.ObjectId(messageId) },
    });

    if (!message) {
      throw new Error("Message not found");
    }

    const sellerId = message.createdBy._id || message.createdBy;
    const chatRoomId = message.chatRoomId;

    console.log(
      `📧 Creating purchase notification: buyer=${buyerId}, seller=${sellerId}, amount=$${amount}`
    );

    // Create purchase notification
    const notificationResult = await createMessagePurchaseNotification({
      messageId,
      buyerId,
      sellerId: sellerId.toString(),
      amount,
      chatRoomId,
    });

    if (!notificationResult.success && !notificationResult.skipped) {
      console.error(
        "❌ Failed to create purchase notification:",
        notificationResult.error
      );
      // Don't fail the whole process if notification fails
    }

    console.log(`✅ Message purchase completion processed successfully`);

    return {
      success: true,
      message: "Purchase processed successfully",
      notificationCreated: notificationResult.success,
      chatRoomId,
    };
  } catch (error) {
    console.error("❌ Error handling message purchase completion:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
