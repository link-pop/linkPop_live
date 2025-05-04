const Notification = require("../models/NotificationModel");

/**
 * Calculate the number of unique users who have sent unread messages to a specific user
 * @param {string} userId - The ID of the user to check for
 * @returns {Promise<number>} - The count of unique message senders
 */
async function getUniqueMessageSendersCount(userId) {
  try {
    // Get all unread message notifications for this user
    const unreadMessageNotifications = await Notification.find({
      userId,
      type: "message",
      read: false,
    });
    
    // Extract unique source user IDs
    const uniqueSourceUserIds = new Set();
    unreadMessageNotifications.forEach(notification => {
      if (notification.sourceUserId) {
        uniqueSourceUserIds.add(notification.sourceUserId.toString());
      }
    });
    
    return uniqueSourceUserIds.size;
  } catch (error) {
    console.error("Error calculating unique message senders:", error);
    return 0;
  }
}

module.exports = getUniqueMessageSendersCount;
