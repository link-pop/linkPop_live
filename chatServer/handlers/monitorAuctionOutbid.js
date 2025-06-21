const Notification = require("../models/NotificationModel");
const SOCKET_EVENTS = require("../constants/socketEvents");

// * Monitors auction outbid notifications and sends them via socket.io
// * Runs every 5 minutes to batch process notifications for optimal performance
function startAuctionOutbidMonitor(io) {
  setInterval(async () => {
    try {
      await processOutbidNotifications(io);
      console.log(
        `Finished processing auction outbid notifications at: ${new Date()}`
      );
    } catch (error) {
      console.error("❌ Error processing auction outbid notifications:", error);
      io.emit(SOCKET_EVENTS.NOTIFICATION.ERROR, {
        error: "Error processing auction outbid notifications",
        timestamp: new Date(),
      });
    }
  }, 3000); // TODO ! NOT NOW ! Check every 5 minutes (300,000 milliseconds)
}

// Process pending outbid notifications
async function processOutbidNotifications(io) {
  try {
    // Find all outbid notifications that need socket notification but haven't been sent yet
    const pendingNotifications = await Notification.find({
      type: "auction_outbid",
      needsSocketNotification: true,
      socketNotificationSent: false,
    })
      .populate("sourceUserId", "username email") // Populate the bidder who caused the outbid
      .sort({ createdAt: 1 }) // Process oldest first
      .limit(1000); // Limit to prevent memory issues with very large batches

    if (pendingNotifications.length === 0) {
      return;
    }

    console.log(
      `🔔 Processing ${pendingNotifications.length} pending auction outbid notifications`
    );

    let successCount = 0;
    let errorCount = 0;

    // Process each notification
    for (const notification of pendingNotifications) {
      try {
        // Send socket notification to the user
        io.emit(
          SOCKET_EVENTS.NOTIFICATION.USER(notification.userId.toString()),
          {
            _id: notification._id,
            userId: notification.userId,
            type: notification.type,
            title: notification.title,
            content: notification.content,
            sourceId: notification.sourceId,
            sourceModel: notification.sourceModel,
            sourceUserId: notification.sourceUserId,
            read: notification.read,
            link: notification.link,
            createdAt: notification.createdAt,
            updatedAt: notification.updatedAt,
          }
        );

        // Send notification count update to the user
        await sendNotificationCountUpdate(notification.userId.toString(), io);

        // Mark as sent in database
        await Notification.findByIdAndUpdate(
          notification._id,
          {
            socketNotificationSent: true,
            needsSocketNotification: false, // No longer needs to be sent
          },
          { new: true }
        );

        successCount++;

        console.log(
          `✅ Sent outbid notification to user ${notification.userId} for auction ${notification.sourceId}`
        );
      } catch (notificationError) {
        console.error(
          `❌ Error sending outbid notification ${notification._id}:`,
          notificationError
        );
        errorCount++;

        // Don't mark as sent if there was an error - will retry next cycle
      }
    }

    console.log(
      `🔔 Auction outbid notification batch complete: ${successCount} sent, ${errorCount} errors`
    );

    // Emit general stats for monitoring
    io.emit(SOCKET_EVENTS.NOTIFICATION.BATCH_COMPLETE, {
      type: "auction_outbid",
      processed: pendingNotifications.length,
      successful: successCount,
      failed: errorCount,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("❌ Error in processOutbidNotifications:", error);
    throw error;
  }
}

// Send notification count update to a specific user
async function sendNotificationCountUpdate(userId, io) {
  try {
    // Get total unread notification count
    const totalUnreadCount = await Notification.countDocuments({
      userId: userId,
      read: false,
    });

    // Get unread message notification count
    const messageUnreadCount = await Notification.countDocuments({
      userId: userId,
      type: "message",
      read: false,
    });

    // Send count update
    io.emit(SOCKET_EVENTS.NOTIFICATION.COUNT, {
      userId: userId,
      count: totalUnreadCount,
      messageCount: messageUnreadCount,
    });
  } catch (error) {
    console.error(
      `❌ Error sending notification count update for user ${userId}:`,
      error
    );
  }
}

module.exports = startAuctionOutbidMonitor;
