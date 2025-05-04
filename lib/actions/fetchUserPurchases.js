"use server";

import { getAll } from "./crud";

/**
 * Fetches all completed purchases for a user
 * @param {Object} mongoUser - The MongoDB user object
 * @returns {Array} Array of purchase objects with postId
 */
export const fetchUserPurchases = async (mongoUser) => {
  if (!mongoUser?._id) {
    return [];
  }

  try {
    const purchases = await getAll({
      col: { name: "purchases" },
      data: {
        userId: mongoUser._id,
        status: "completed",
      },
    });

    return purchases || [];
  } catch (error) {
    console.error("Error fetching user purchases:", error);
    return [];
  }
};
