"use server";

import { getAll } from "./crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import { getLastBookmarkThumbnails } from "@/lib/utils/mongo/getLastBookmarkThumbnails";
import mongoose from "mongoose";

export async function getUserBookmarkLists() {
  try {
    console.log("🔍 getUserBookmarkLists called");
    const { mongoUser } = await getMongoUser();

    if (!mongoUser?._id) {
      console.log("❌ No mongoUser found");
      return [];
    }

    console.log("🔍 mongoUser found:", mongoUser._id);

    const lists = await getAll({
      col: "userlists",
      data: {
        createdBy: new mongoose.Types.ObjectId(mongoUser._id),
        active: true,
        targetCollection: "bookmarks", // Only show lists for bookmarks
      },
    });

    console.log("777 lists", lists);

    // Ensure we return a plain array, even if getAll returns an error
    if (!Array.isArray(lists)) {
      return [];
    }

    // Add bookmark count and lastBookmarkThumbnails to each list
    const listsWithExtendedData = await Promise.all(
      lists.map(async (list) => {
        const bookmarkCount = (list.bookmarkIds || []).length;

        // Get lastBookmarkThumbnails if not present or if bookmarkIds have changed
        let lastBookmarkThumbnails = list.lastBookmarkThumbnails || [];

        // If lastBookmarkThumbnails is empty but we have bookmarkIds, fetch them
        if (
          lastBookmarkThumbnails.length === 0 &&
          list.bookmarkIds &&
          list.bookmarkIds.length > 0
        ) {
          lastBookmarkThumbnails = await getLastBookmarkThumbnails(
            list.bookmarkIds
          );
        }

        return {
          ...list,
          bookmarkCount,
          lastBookmarkThumbnails,
        };
      })
    );

    return listsWithExtendedData;
  } catch (error) {
    console.error("❌ Error fetching user bookmark lists:", error);
    return [];
  }
}
