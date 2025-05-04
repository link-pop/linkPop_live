const Notification = require("../models/NotificationModel");
const getUniqueMessageSendersCount = require("./getUniqueMessageSendersCount");
const SOCKET_EVENTS = require("../constants/socketEvents");

/**
 * Send notification counts (total unread and unique message senders) to a user
 * @param {string} userId - The ID of the user to send counts to
 * @param {object} io - Socket.io instance
 * @returns {Promise<void>}
 */
async function sendNotificationCounts(userId, io) {
  try {
    // Get total unread count
    const unreadCount = await Notification.countDocuments({
      userId,
      read: false,
    });
    
    // Get unique message senders count
    const uniqueMessageSendersCount = await getUniqueMessageSendersCount(userId);
    
    // Send both counts
    io.emit(SOCKET_EVENTS.NOTIFICATION.COUNT, {
      userId,
      count: unreadCount,
      messageCount: uniqueMessageSendersCount
    });
    
    console.log(`Sent notification counts for ${userId}: total=${unreadCount}, messages=${uniqueMessageSendersCount}`);
  } catch (error) {
    console.error("Error sending notification counts:", error);
  }
}

module.exports = sendNotificationCounts;
