import mongoose from "mongoose";
import { getAll } from "./crud";

// Helper function to fetch hidden posts
export const fetchUserHiddenPosts = async (mongoUser, col) => {
  if (!col) {
    console.warn("col is missing");
    return [];
  }
  if (!mongoUser?._id) return [];

  const hiddenPosts = await getAll({
    col,
    data: {
      userId: mongoUser._id,
    },
  });

  return Array.isArray(hiddenPosts)
    ? hiddenPosts.map((hidden) => {
        const postId = hidden.postId?._id || hidden.postId;
        return new mongoose.Types.ObjectId(postId);
      })
    : [];
};
