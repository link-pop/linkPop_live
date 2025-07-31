"use server";

import { update } from "./crud";
import getMongoUser from "../utils/mongo/getMongoUser";

export async function updatePostWithPoll(postId, pollId) {
  try {
    const { mongoUser } = await getMongoUser();
    if (!mongoUser) {
      throw new Error("User not authenticated");
    }

    // Update post to include poll reference
    const updatedPost = await update({
      col: "feeds",
      data: { _id: postId },
      update: { pollId },
      revalidate: "/feeds",
    });

    if (updatedPost.error) {
      throw new Error(updatedPost.error);
    }

    return updatedPost;
  } catch (error) {
    console.error("❌ Error updating post with poll:", error);
    throw error;
  }
}
