"use server";

import { update } from "./crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import mongoose from "mongoose";

export async function removeBookmarksFromBookmarkList(listId, bookmarkIds) {
  try {
    const { mongoUser } = await getMongoUser();

    if (!mongoUser?._id) {
      return { error: "User not authenticated" };
    }

    if (
      !listId ||
      !bookmarkIds ||
      !Array.isArray(bookmarkIds) ||
      bookmarkIds.length === 0
    ) {
      return { error: "Invalid list ID or bookmark IDs" };
    }

    // Convert bookmarkIds to ObjectIds
    const objectIds = bookmarkIds.map((id) =>
      id instanceof mongoose.Types.ObjectId
        ? id
        : new mongoose.Types.ObjectId(id)
    );

    // Remove bookmarks from the list
    console.log("🔍 Removing bookmarks from list:", {
      listId,
      bookmarkIds: objectIds.map((id) => id.toString()),
      userId: mongoUser._id.toString(),
    });

    const result = await update({
      col: "userlists",
      data: {
        _id: new mongoose.Types.ObjectId(listId),
        createdBy: new mongoose.Types.ObjectId(mongoUser._id),
        targetCollection: "bookmarks", // Ensure it's a bookmark list
      },
      update: {
        $pull: {
          bookmarkIds: { $in: objectIds },
        },
      },
      skipOwnershipCheck: false, // We want to verify ownership
    });

    if (result.error) {
      console.log("❌ Error removing bookmarks from list:", result.error);
      return { error: result.error };
    }

    console.log("✅ Successfully removed bookmarks from list");
    return { success: true };
  } catch (error) {
    console.error("❌ Error removing bookmarks from list:", error);
    return { error: "Failed to remove bookmarks from list" };
  }
}
