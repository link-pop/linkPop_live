// TODO !!!!! delete
// /**
//  * Utility functions for handling different notification types
//  */

// /**
//  * Checks if a notification is a message notification
//  * @param {Object} notification - The notification object to check
//  * @returns {boolean} - True if it's a message notification
//  */
// export function isMessageNotification(notification) {
//   return notification?.type === "message";
// }

// /**
//  * Checks if a notification is a general (non-message) notification
//  * @param {Object} notification - The notification object to check
//  * @returns {boolean} - True if it's a general notification
//  */
// export function isGeneralNotification(notification) {
//   return notification?.type !== "message";
// }

// /**
//  * Groups notifications by their type
//  * @param {Array} notifications - Array of notification objects
//  * @returns {Object} - Object with notifications grouped by type
//  */
// export function groupNotificationsByType(notifications) {
//   if (!notifications || !Array.isArray(notifications)) {
//     return {};
//   }

//   return notifications.reduce((groups, notification) => {
//     const type = notification.type || "other";

//     if (!groups[type]) {
//       groups[type] = [];
//     }

//     groups[type].push(notification);
//     return groups;
//   }, {});
// }
