"use server";

import { getAll } from "./crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";

export async function getUserBookmarks() {
  try {
    const { mongoUser } = await getMongoUser();

    if (!mongoUser?._id) {
      return [];
    }

    console.log("🔍 getUserBookmarks - Starting for user:", mongoUser._id);

    // Get all bookmarks for the current user
    const bookmarks = await getAll({
      col: "bookmarks",
      data: {
        userId: mongoUser._id,
      },
      populate: [
        {
          path: "postId",
          populate: [
            {
              path: "createdBy",
              select:
                "name username displayName bio profileImage imageUrl avatar _id",
            },
            {
              path: "files",
              select:
                "fileUrl fileType blurredUrl isPaid fileName fileBytes tags",
            },
          ],
        },
      ], // Populate the bookmarked post with creator info and files
      sort: { createdAt: -1 },
    });

    // Debug logging to verify population worked
    if (bookmarks && bookmarks.length > 0) {
      console.log("🔍 getUserBookmarks - Total bookmarks:", bookmarks.length);

      // Check first bookmark in detail
      const firstBookmark = bookmarks[0];
      console.log("🔍 getUserBookmarks - First bookmark structure:", {
        bookmarkId: firstBookmark._id,
        userId: firstBookmark.userId,
        postType: firstBookmark.postType,
        postIdType: typeof firstBookmark.postId,
        postIdHasData:
          firstBookmark.postId && typeof firstBookmark.postId === "object",
        postText: firstBookmark.postId?.text || "NO TEXT",
        createdByExists: !!firstBookmark.postId?.createdBy,
        createdByName: firstBookmark.postId?.createdBy?.name || "NO NAME",
        filesCount: firstBookmark.postId?.files?.length || 0,
        firstFileUrl: firstBookmark.postId?.files?.[0]?.fileUrl || "NO FILE",
      });

      // Check if population worked properly
      const populatedCount = bookmarks.filter(
        (bookmark) =>
          bookmark.postId &&
          typeof bookmark.postId === "object" &&
          bookmark.postId.text
      ).length;

      console.log(
        "🔍 getUserBookmarks - Properly populated bookmarks:",
        populatedCount
      );
      console.log(
        "🔍 getUserBookmarks - Population success rate:",
        `${populatedCount}/${bookmarks.length} (${Math.round(
          (populatedCount / bookmarks.length) * 100
        )}%)`
      );
    } else {
      console.log("🔍 getUserBookmarks - No bookmarks found");
    }

    // Properly serialize Mongoose documents to plain objects
    const serializedBookmarks = Array.isArray(bookmarks)
      ? bookmarks.map((bookmark) => {
          // Convert Mongoose document to plain object
          const plainBookmark = bookmark.toObject
            ? bookmark.toObject()
            : bookmark;

          // Ensure nested populated fields are also converted
          if (plainBookmark.postId && plainBookmark.postId.toObject) {
            plainBookmark.postId = plainBookmark.postId.toObject();

            // Also handle nested createdBy if it exists
            if (
              plainBookmark.postId.createdBy &&
              plainBookmark.postId.createdBy.toObject
            ) {
              plainBookmark.postId.createdBy =
                plainBookmark.postId.createdBy.toObject();
            }

            // Handle nested files if they exist
            if (
              plainBookmark.postId.files &&
              Array.isArray(plainBookmark.postId.files)
            ) {
              plainBookmark.postId.files = plainBookmark.postId.files.map(
                (file) => (file.toObject ? file.toObject() : file)
              );
            }
          }

          // Convert ObjectIds to strings for client components
          if (plainBookmark._id) {
            plainBookmark._id = plainBookmark._id.toString();
          }
          if (plainBookmark.userId) {
            plainBookmark.userId = plainBookmark.userId.toString();
          }
          if (plainBookmark.postId && plainBookmark.postId._id) {
            plainBookmark.postId._id = plainBookmark.postId._id.toString();
          }
          if (
            plainBookmark.postId &&
            plainBookmark.postId.createdBy &&
            plainBookmark.postId.createdBy._id
          ) {
            plainBookmark.postId.createdBy._id =
              plainBookmark.postId.createdBy._id.toString();
          }

          // Convert file ObjectIds to strings
          if (plainBookmark.postId && plainBookmark.postId.files) {
            plainBookmark.postId.files = plainBookmark.postId.files.map(
              (file) => ({
                ...file,
                _id: file._id ? file._id.toString() : file._id,
              })
            );
          }

          // Final JSON serialization to ensure all data is plain
          return JSON.parse(JSON.stringify(plainBookmark));
        })
      : [];

    console.log(
      "🔍 getUserBookmarks - Serialized bookmarks count:",
      serializedBookmarks.length
    );

    return serializedBookmarks;
  } catch (error) {
    console.error("❌ Error fetching bookmarks:", error);
    return [];
  }
}
