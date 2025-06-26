const ChatMessage = require("../models/ChatMessageModel");
const SOCKET_EVENTS = require("../constants/socketEvents");

/**
 * Mark messages as read when a user views a chat room
 * @param {string} chatRoomId - The ID of the chat room being viewed
 * @param {string} viewerUserId - The ID of the user viewing the chat room
 * @param {object} io - Socket.io instance for emitting updates
 * @returns {Promise<void>}
 */
async function markMessagesAsRead(chatRoomId, viewerUserId, io) {
  try {
    // Find all messages in this chat room that:
    // 1. Were NOT sent by the viewer
    // 2. Have status "delivered" (not already "read" or "failed")
    const messagesToUpdate = await ChatMessage.find({
      chatRoomId: chatRoomId,
      createdBy: { $ne: viewerUserId },
      chatMsgStatus: "delivered",
    });

    if (messagesToUpdate.length === 0) {
      console.log(`No messages to mark as read in chat room ${chatRoomId}`);
      return;
    }

    // Update all these messages to "read" status
    const updateResult = await ChatMessage.updateMany(
      {
        chatRoomId: chatRoomId,
        createdBy: { $ne: viewerUserId },
        chatMsgStatus: "delivered",
      },
      {
        $set: { chatMsgStatus: "read" },
      }
    );

    console.log(
      `Marked ${updateResult.modifiedCount} messages as read in chat room ${chatRoomId} for viewer ${viewerUserId}`
    );

    if (updateResult.modifiedCount > 0) {
      // Get the IDs of updated messages
      const updatedMessageIds = messagesToUpdate.map((msg) =>
        msg._id.toString()
      );

      // Emit socket event to notify all users in the chat room about the read status update
      io.emit(SOCKET_EVENTS.CHAT.MESSAGE.READ_STATUS_UPDATED(chatRoomId), {
        chatRoomId,
        viewerUserId,
        updatedMessageIds,
        newStatus: "read",
      });

      console.log(
        `Emitted read status update for ${updatedMessageIds.length} messages in chat room ${chatRoomId}`
      );
    }
  } catch (error) {
    console.error("❌ Error marking messages as read:", error);
  }
}

module.exports = markMessagesAsRead;
