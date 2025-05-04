import { getAll } from "./crud";

/**
 * Fetches active subscriptions for a user
 * @param {Object} mongoUser - The current user
 * @returns {Array} Array of subscription objects
 */
export async function fetchUserSubscriptions(mongoUser) {
  if (!mongoUser) {
    return [];
  }

  return await getAll({
    col: { name: "subscriptions" },
    data: { createdBy: mongoUser._id, active: true },
  });
}

/**
 * Creates a Set of user IDs the current user is subscribed to
 * @param {Array} subscriptions - Array of subscription objects
 * @returns {Set} Set of user IDs the current user is subscribed to
 */
export function getSubscribedToUserIds(subscriptions) {
  return new Set(
    subscriptions
      .map((sub) => sub.subscribedTo?._id?.toString() || "")
      .filter(Boolean)
  );
}
