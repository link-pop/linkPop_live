const Notification = require("../models/NotificationModel");
const ChatRoom = require("../models/ChatRoomModel");
const sendNotificationCounts = require("./sendNotificationCounts");
const sendChatRoomUnreadCounts = require("./sendChatRoomUnreadCounts");
const SOCKET_EVENTS = require("../constants/socketEvents");

/**
 * Updates unread counts for a chat room when a new message is sent
 * @param {string} chatRoomId - The chat room ID
 * @param {string} senderId - The ID of the user who sent the message
 */
async function updateChatRoomUnreadCounts(chatRoomId, senderId) {
  try {
    const chatRoom = await ChatRoom.findById(chatRoomId);
    if (!chatRoom) return;

    // Increment unread count for all users except the sender
    for (const userId of chatRoom.chatRoomUsers) {
      if (userId.toString() !== senderId.toString()) {
        const currentCount = chatRoom.unreadCounts.get(userId.toString()) || 0;
        chatRoom.unreadCounts.set(userId.toString(), currentCount + 1);
      }
    }

    await chatRoom.save();
  } catch (error) {
    console.error("❌ Error updating chat room unread counts:", error);
  }
}

/**
 * Process notifications that need socket notifications
 * @param {object} io - Socket.io instance
 */
async function processPendingNotifications(io) {
  try {
    // Find notifications that need socket notifications but haven't been sent yet
    const pendingNotifications = await Notification.find({
      needsSocketNotification: true,
      socketNotificationSent: false,
    }).limit(100); // Process in batches

    if (pendingNotifications.length === 0) {
      return;
    }

    console.log(
      `Processing ${pendingNotifications.length} pending notifications`
    );

    for (const notification of pendingNotifications) {
      try {
        // Update chat room unread counts if this is a message notification
        if (
          notification.type === "message" &&
          notification.sourceModel === "chatmessages"
        ) {
          // Extract chatroom ID from the link
          const linkMatch = notification.link.match(/chatId=([^&]+)/);
          if (linkMatch && linkMatch[1]) {
            const chatRoomId = linkMatch[1];
            await updateChatRoomUnreadCounts(
              chatRoomId,
              notification.sourceUserId
            );

            // Send updated unread counts to the recipient
            await sendChatRoomUnreadCounts(notification.userId, io);
          }
        }

        // Emit notification to the user
        io.emit(
          SOCKET_EVENTS.NOTIFICATION.USER(notification.userId),
          notification
        );

        // Send updated notification counts
        await sendNotificationCounts(notification.userId, io);

        // Mark as processed
        await Notification.findByIdAndUpdate(notification._id, {
          socketNotificationSent: true,
          needsSocketNotification: false,
        });

        console.log(
          `Sent socket notification for notification ${notification._id} to user ${notification.userId}`
        );
      } catch (error) {
        console.error(
          `❌ Error processing notification ${notification._id}:`,
          error
        );
      }
    }

    console.log(
      `✅ Processed ${pendingNotifications.length} pending notifications`
    );
  } catch (error) {
    console.error("❌ Error processing pending notifications:", error);
  }
}

/**
 * Start the pending notifications processor
 * @param {object} io - Socket.io instance
 */
function startPendingNotificationsProcessor(io) {
  // Process pending notifications every 5 seconds
  setInterval(async () => {
    await processPendingNotifications(io);
  }, 5000);

  console.log("✅ Pending notifications processor started");
}

module.exports = {
  processPendingNotifications,
  startPendingNotificationsProcessor,
};
