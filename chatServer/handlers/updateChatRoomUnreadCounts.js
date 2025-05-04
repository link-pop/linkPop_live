const ChatRoom = require("../models/ChatRoomModel");

/**
 * Update unread message counts for a chat room
 * @param {string} chatRoomId - The ID of the chat room
 * @param {string} senderUserId - The ID of the user who sent the message
 * @returns {Promise<void>}
 */
async function updateChatRoomUnreadCounts(chatRoomId, senderUserId) {
  try {
    // Get the chat room
    const chatRoom = await ChatRoom.findById(chatRoomId);
    
    if (!chatRoom) {
      console.error("Chat room not found:", chatRoomId);
      return;
    }
    
    // Get current unread counts or initialize if not exists
    const unreadCounts = chatRoom.unreadCounts || new Map();
    
    // Increment unread count for each user except the sender
    for (const userId of chatRoom.chatRoomUsers) {
      // Skip the sender
      if (userId.toString() === senderUserId.toString()) continue;
      
      // Get current count or default to 0
      const currentCount = unreadCounts.get(userId.toString()) || 0;
      
      // Increment count
      unreadCounts.set(userId.toString(), currentCount + 1);
    }
    
    // Update the chat room with new unread counts
    await ChatRoom.findByIdAndUpdate(chatRoomId, {
      unreadCounts
    });
    
    console.log(`Updated unread counts for chat room ${chatRoomId}`);
  } catch (error) {
    console.error("Error updating chat room unread counts:", error);
  }
}

/**
 * Reset unread count for a specific user in a chat room
 * @param {string} chatRoomId - The ID of the chat room
 * @param {string} userId - The ID of the user to reset count for
 * @returns {Promise<void>}
 */
async function resetChatRoomUnreadCount(chatRoomId, userId) {
  try {
    // Update the unread count for the specific user to 0
    await ChatRoom.findByIdAndUpdate(
      chatRoomId,
      { [`unreadCounts.${userId}`]: 0 }
    );
    
    console.log(`Reset unread count for user ${userId} in chat room ${chatRoomId}`);
  } catch (error) {
    console.error("Error resetting chat room unread count:", error);
  }
}

module.exports = {
  updateChatRoomUnreadCounts,
  resetChatRoomUnreadCount
};
