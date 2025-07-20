"use server";

import { getAll } from "./crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";

export async function getUserCustomLists() {
  try {
    const { mongoUser } = await getMongoUser();

    if (!mongoUser?._id) {
      return [];
    }

    // Get all user lists that target users collection (not attachments)
    const lists = await getAll({
      col: "userlists",
      data: {
        createdBy: mongoUser._id,
        active: true,
        targetCollection: "users", // Only show lists for users
      },
      sort: { sortOrder: 1, createdAt: -1 },
    });

    // Ensure each list has lastUserProfileImages updated if it has userIds
    const updatedLists = await Promise.all(
      (Array.isArray(lists) ? lists : []).map(async (list) => {
        if (
          list.userIds &&
          Array.isArray(list.userIds) &&
          list.userIds.length > 0
        ) {
          // Import the function here to avoid circular dependencies
          const { getLastUserProfileImages } = await import(
            "@/lib/utils/mongo/getLastUserProfileImages"
          );
          const lastUserProfileImages = await getLastUserProfileImages(
            list.userIds
          );

          // Only update if the images are different
          if (
            JSON.stringify(lastUserProfileImages) !==
            JSON.stringify(list.lastUserProfileImages)
          ) {
            const { update } = await import("./crud");
            await update({
              col: "userlists",
              data: { _id: list._id },
              update: {
                lastUserProfileImages,
              },
            });
            return { ...list, lastUserProfileImages };
          }
        }
        return list;
      })
    );

    return updatedLists;
  } catch (error) {
    console.error("❌ Error fetching user custom lists:", error);
    return [];
  }
}
