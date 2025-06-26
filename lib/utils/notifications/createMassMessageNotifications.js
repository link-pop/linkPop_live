import { add } from "@/lib/actions/crud";
import mongoose from "mongoose";

/**
 * Creates notifications for mass messages by directly creating notification records
 * and marking them for socket notification processing
 * @param {Array} messageResults - Array of message results from sendMassMessage
 * @param {string} senderId - ID of the user who sent the messages
 * @param {string} messageText - The message content
 * @param {Array} files - Array of files attached to the message
 */
export async function createMassMessageNotifications({
  messageResults,
  senderId,
  messageText,
  files = [],
}) {
  try {
    const notifications = [];

    for (const result of messageResults) {
      const { recipientId, chatroomId, messageId } = result;

      // Create notification data
      const notificationData = {
        userId: new mongoose.Types.ObjectId(recipientId),
        type: "message",
        title: "New Message",
        content:
          messageText && messageText.length > 0
            ? messageText.length > 50
              ? `${messageText.substring(0, 50)}...`
              : messageText
            : files && files.length > 0
            ? "Sent files"
            : "New message",
        sourceId: new mongoose.Types.ObjectId(messageId),
        sourceModel: "chatmessages",
        sourceUserId: new mongoose.Types.ObjectId(senderId),
        link: `/chatrooms?chatId=${chatroomId}`,
        needsSocketNotification: true, // Mark for socket notification
        socketNotificationSent: false,
      };

      // Create the notification in the database
      const notification = await add({
        col: "notifications",
        data: notificationData,
      });

      if (notification && !notification.error) {
        notifications.push({
          notificationId: notification._id,
          recipientId,
          chatroomId,
          messageId,
        });
      }
    }

    console.log(
      `✅ Created ${notifications.length} mass message notifications`
    );
    return {
      success: true,
      notifications,
      count: notifications.length,
    };
  } catch (error) {
    console.error("❌ Error creating mass message notifications:", error);
    return {
      success: false,
      error: error.message,
      notifications: [],
      count: 0,
    };
  }
}
