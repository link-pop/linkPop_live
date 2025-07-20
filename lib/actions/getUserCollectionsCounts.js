"use server";

import { getAll } from "./crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";

export async function getUserCollectionsCounts(
  systemLists,
  userLists = [],
  subscriptions = [],
  subscribers = []
) {
  try {
    const { mongoUser } = await getMongoUser();

    if (!mongoUser?._id) {
      return {};
    }

    // Create counts object for system lists
    const systemCounts = {
      subscriptions: Array.isArray(subscriptions) ? subscriptions.length : 0,
      subscribers: Array.isArray(subscribers) ? subscribers.length : 0,
    };

    // Get counts for custom user lists
    const customListCounts = await Promise.all(
      (userLists || []).map(async (list) => {
        // For custom user lists, count the userIds directly
        if (list.userIds && Array.isArray(list.userIds)) {
          // Filter out any null/undefined values and count valid userIds
          const validUserIds = list.userIds.filter((userId) => {
            if (typeof userId === "string") {
              return userId && userId.trim() !== "";
            } else if (userId && typeof userId === "object" && userId._id) {
              return userId._id && userId._id.toString().trim() !== "";
            } else if (userId && userId.toString) {
              return userId.toString().trim() !== "";
            }
            return false;
          });
          return validUserIds.length;
        }

        // Fallback: if the list has filterCriteria, we could query the users collection
        // but for now, return 0 if no userIds
        return 0;
      })
    );

    // Add custom list counts
    (userLists || []).forEach((list, index) => {
      systemCounts[list.slug] = customListCounts[index] || 0;
    });

    return systemCounts;
  } catch (error) {
    console.error("❌ Error fetching user collections counts:", error);
    return {};
  }
}
