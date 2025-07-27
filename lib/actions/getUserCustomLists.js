"use server";

import { getAll } from "./crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";

export async function getUserCustomLists(targetCollection = "users") {
  try {
    const { mongoUser } = await getMongoUser();

    if (!mongoUser?._id) {
      return [];
    }

    // Get all user lists that target the specified collection
    const lists = await getAll({
      col: "userlists",
      data: {
        createdBy: mongoUser._id,
        active: true,
        targetCollection: targetCollection, // Support different collection types
      },
      sort: { sortOrder: 1, createdAt: -1 },
    });

    // Ensure each list has proper preview images updated based on collection type
    const updatedLists = await Promise.all(
      (Array.isArray(lists) ? lists : []).map(async (list) => {
        if (
          targetCollection === "users" &&
          list.userIds &&
          Array.isArray(list.userIds) &&
          list.userIds.length > 0
        ) {
          // Handle user collections
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
              update: { lastUserProfileImages },
            });
            return { ...list, lastUserProfileImages };
          }
        } else if (
          targetCollection === "bookmarks" &&
          list.bookmarkIds &&
          Array.isArray(list.bookmarkIds) &&
          list.bookmarkIds.length > 0
        ) {
          // Handle bookmark collections
          const { getLastBookmarkThumbnails } = await import(
            "@/lib/utils/mongo/getLastBookmarkThumbnails"
          );
          const lastBookmarkThumbnails = await getLastBookmarkThumbnails(
            list.bookmarkIds
          );

          // Only update if the thumbnails are different
          if (
            JSON.stringify(lastBookmarkThumbnails) !==
            JSON.stringify(list.lastBookmarkThumbnails)
          ) {
            const { update } = await import("./crud");
            await update({
              col: "userlists",
              data: { _id: list._id },
              update: { lastBookmarkThumbnails },
            });
            return { ...list, lastBookmarkThumbnails };
          }
        } else if (
          targetCollection === "postlabels" &&
          list.postLabelIds &&
          Array.isArray(list.postLabelIds) &&
          list.postLabelIds.length > 0
        ) {
          // Handle post label collections
          const { getLastPostLabelThumbnails } = await import(
            "@/lib/utils/mongo/getLastPostLabelThumbnails"
          );

          // Extract just the IDs from postLabelIds (they might be populated objects)
          const feedPostIds = list.postLabelIds.map((item) => {
            if (typeof item === "object" && item !== null) {
              return item._id ? item._id.toString() : item.toString();
            }
            return item.toString();
          });

          const lastPostLabelThumbnails = await getLastPostLabelThumbnails(
            feedPostIds
          );

          // Only update if the thumbnails are different
          if (
            JSON.stringify(lastPostLabelThumbnails) !==
            JSON.stringify(list.lastPostLabelThumbnails)
          ) {
            const { update } = await import("./crud");
            await update({
              col: "userlists",
              data: { _id: list._id },
              update: { lastPostLabelThumbnails },
            });
            return { ...list, lastPostLabelThumbnails };
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
