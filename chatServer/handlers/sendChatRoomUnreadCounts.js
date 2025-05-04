const ChatRoom = require("../models/ChatRoomModel");
const SOCKET_EVENTS = require("../constants/socketEvents");

/**
 * Send chat room unread counts to a specific user
 * @param {string} userId - The ID of the user to send unread counts to
 * @param {object} io - Socket.io instance
 * @returns {Promise<void>}
 */
async function sendChatRoomUnreadCounts(userId, io) {
  try {
    // Find all chat rooms where this user is a member
    const chatRooms = await ChatRoom.find({
      chatRoomUsers: userId
    });
    
    // Create a map of chatRoomId -> unreadCount
    const unreadCountsMap = {};
    
    for (const room of chatRooms) {
      // Get this user's unread count for this room
      const unreadCount = room.unreadCounts?.get(userId.toString()) || 0;
      unreadCountsMap[room._id.toString()] = unreadCount;
    }
    
    // Emit the unread counts to the user
    io.emit(SOCKET_EVENTS.CHAT.ROOM.UNREAD_COUNTS, {
      userId,
      unreadCounts: unreadCountsMap
    });
    
    console.log(`Sent chat room unread counts for user ${userId}`);
  } catch (error) {
    console.error("Error sending chat room unread counts:", error);
  }
}

module.exports = sendChatRoomUnreadCounts;
