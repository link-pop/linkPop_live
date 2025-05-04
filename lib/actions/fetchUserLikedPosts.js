import { getAll } from "@/lib/actions/crud";
import mongoose from "mongoose";

export async function fetchUserLikedPosts(mongoUser, postType) {
  if (!mongoUser?._id) return [];

  const likes = await getAll({
    col: "likes",
    data: {
      userId: mongoUser._id,
      postType,
    },
  });

  return Array.isArray(likes)
    ? likes.map((like) => {
        // Handle both string and populated object cases
        const postId = like.postId?._id || like.postId;
        return new mongoose.Types.ObjectId(postId);
      })
    : [];
}
