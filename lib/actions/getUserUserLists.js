"use server";

import { getAll } from "./crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import { getLastUserProfileImages } from "@/lib/utils/mongo/getLastUserProfileImages";

export async function getUserUserLists() {
  try {
    const { mongoUser } = await getMongoUser();

    if (!mongoUser?._id) {
      return [];
    }

    const lists = await getAll({
      col: "userlists",
      data: {
        createdBy: mongoUser._id,
        active: true,
        targetCollection: "users", // Only show lists for users
      },
    });

    // Ensure we return a plain array, even if getAll returns an error
    if (!Array.isArray(lists)) {
      return [];
    }

    // Add user count and lastUserProfileImages to each list
    const listsWithExtendedData = await Promise.all(
      lists.map(async (list) => {
        const userCount = (list.userIds || []).length;

        // Get lastUserProfileImages if not present or if userIds have changed
        let lastUserProfileImages = list.lastUserProfileImages || [];

        // If lastUserProfileImages is empty but we have userIds, fetch them
        if (
          lastUserProfileImages.length === 0 &&
          list.userIds &&
          list.userIds.length > 0
        ) {
          lastUserProfileImages = await getLastUserProfileImages(list.userIds);
        }

        return {
          ...list,
          userCount,
          lastUserProfileImages,
        };
      })
    );

    return listsWithExtendedData;
  } catch (error) {
    console.error("❌ Error fetching user lists for users:", error);
    return [];
  }
}
