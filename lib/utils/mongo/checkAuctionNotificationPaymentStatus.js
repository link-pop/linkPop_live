import { getOne } from "@/lib/actions/crud";

/**
 * Check auction payment status for auction_won notifications
 * @param {Array} notifications - Array of notification objects
 * @param {string} mongoUserId - Current user's MongoDB ID
 * @returns {Array} - Notifications with payment status metadata added
 */
export const checkAuctionNotificationPaymentStatus = async (
  notifications,
  mongoUserId
) => {
  if (!notifications || !Array.isArray(notifications)) {
    return notifications;
  }

  // Process notifications in parallel
  const processedNotifications = await Promise.all(
    notifications.map(async (notification) => {
      // Only check payment status for auction_won notifications
      if (
        notification.type !== "auction_won" ||
        !notification.sourceId ||
        !mongoUserId
      ) {
        return {
          ...notification,
          paymentStatus: {
            isPaid: false,
            loading: false,
            checked: false,
          },
        };
      }

      try {
        // Check if there's already a paid order for this auction item by this user
        const existingOrder = await getOne({
          col: "storeitemsorders",
          data: {
            createdBy: mongoUserId,
            "items.storeItemId": notification.sourceId,
            paymentStatus: "paid",
            $or: [
              { "metadata.auctionWinnerPayment": true },
              { "metadata.auctionBuyNow": true },
            ],
          },
        });

        return {
          ...notification,
          paymentStatus: {
            isPaid: !!existingOrder,
            loading: false,
            checked: true,
            order: existingOrder || null,
          },
        };
      } catch (error) {
        console.error(
          "❌ Error checking auction payment status for notification:",
          notification._id,
          error
        );
        return {
          ...notification,
          paymentStatus: {
            isPaid: false,
            loading: false,
            checked: false,
            error: error.message,
          },
        };
      }
    })
  );

  return processedNotifications;
};
