import { getAll } from "@/lib/actions/crud";
import mongoose from "mongoose";

export async function fetchUserBookmarkedPosts(mongoUser, postType = "feeds") {
  if (!mongoUser?._id) return [];

  const bookmarks = await getAll({
    col: "bookmarks",
    data: {
      userId: mongoUser._id,
      postType,
    },
  });

  return Array.isArray(bookmarks)
    ? bookmarks.map((bookmark) => {
        // Handle both string and populated object cases
        const postId = bookmark.postId?._id || bookmark.postId;
        return new mongoose.Types.ObjectId(postId);
      })
    : [];
} 