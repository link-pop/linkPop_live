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
 * Creates notifications for all chat room users except the sender
 * @param {object} message - The message object
 * @param {object} io - Socket.io instance
 */
async function createMessageNotifications(message, io) {
  try {
    // Get the chat room to find all users
    const chatRoom = await ChatRoom.findById(message.chatRoomId);
    if (!chatRoom) {
      console.error("❌ Chat room not found for message notifications");
      return;
    }

    const chatRoomUsers = chatRoom.chatRoomUsers || [];
    const senderId = message.createdBy;

    // Update unread counts for this chat room
    await updateChatRoomUnreadCounts(message.chatRoomId, senderId);

    // Send updated unread counts to all users in the chat except sender
    for (const chatRoomUser of chatRoomUsers) {
      if (chatRoomUser.toString() !== senderId.toString()) {
        await sendChatRoomUnreadCounts(chatRoomUser, io);
      }
    }

    // Create notifications for all users except the sender
    for (const chatRoomUser of chatRoomUsers) {
      if (chatRoomUser.toString() !== senderId.toString()) {
        const notification = await Notification.create({
          userId: chatRoomUser,
          type: "message",
          title: "New Message",
          content:
            message.chatMsgText && message.chatMsgText.length > 0
              ? message.chatMsgText.length > 50
                ? `${message.chatMsgText.substring(0, 50)}...`
                : message.chatMsgText
              : message.files && message.files.length > 0
              ? "Sent files"
              : "New message",
          sourceId: message._id,
          sourceModel: "chatmessages",
          sourceUserId: senderId,
          link: `/chatrooms?chatId=${message.chatRoomId}`,
        });

        // Emit notification to the user
        io.emit(SOCKET_EVENTS.NOTIFICATION.USER(chatRoomUser), notification);

        // Send updated notification counts (total and message-specific)
        await sendNotificationCounts(chatRoomUser, io);
      }
    }

    console.log(`Created notifications for scheduled message ${message._id}`);
  } catch (error) {
    console.error("❌ Error creating message notifications:", error);
  }
}

module.exports = createMessageNotifications;
