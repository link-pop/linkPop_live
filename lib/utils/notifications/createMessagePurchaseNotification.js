import { add } from "@/lib/actions/crud";
import mongoose from "mongoose";

/**
 * Creates a notification when someone purchases a chat message
 * @param {string} messageId - The ID of the purchased message
 * @param {string} buyerId - The ID of the user who purchased the message
 * @param {string} sellerId - The ID of the user who created the message
 * @param {number} amount - The purchase amount
 * @param {string} chatRoomId - The chat room ID where the message was sent
 */
export async function createMessagePurchaseNotification({
  messageId,
  buyerId,
  sellerId,
  amount,
  chatRoomId,
}) {
  try {
    if (!messageId || !buyerId || !sellerId || !chatRoomId) {
      console.error(
        "❌ Missing required parameters for message purchase notification"
      );
      return { success: false, error: "Missing required parameters" };
    }

    // Don't create notification if buyer and seller are the same
    if (buyerId === sellerId) {
      console.log("Skipping notification - buyer and seller are the same");
      return { success: true, skipped: true };
    }

    // Create notification data
    const notificationData = {
      userId: new mongoose.Types.ObjectId(sellerId),
      type: "message_purchase",
      title: "Message Purchase",
      content: `Someone purchased your message for $${amount}`,
      sourceId: new mongoose.Types.ObjectId(messageId),
      sourceModel: "chatmessages",
      sourceUserId: new mongoose.Types.ObjectId(buyerId),
      link: `/chatrooms?chatId=${chatRoomId}`,
      needsSocketNotification: true, // Mark for socket notification
      socketNotificationSent: false,
    };

    // Create the notification in the database
    const notification = await add({
      col: "notifications",
      data: notificationData,
    });

    if (notification && !notification.error) {
      console.log(
        `✅ Created message purchase notification for seller ${sellerId}`
      );
      return {
        success: true,
        notification,
        notificationId: notification._id,
      };
    } else {
      console.error(
        "❌ Failed to create message purchase notification:",
        notification?.error
      );
      return {
        success: false,
        error: notification?.error || "Failed to create notification",
      };
    }
  } catch (error) {
    console.error("❌ Error creating message purchase notification:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
