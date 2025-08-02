"use server";

import { update } from "./crud";

export async function updatePostWithQuiz(postId, quizId) {
  try {
    if (!postId || !quizId) {
      throw new Error("Post ID and Quiz ID are required");
    }

    // Update post to include quiz reference
    const updatedPost = await update({
      col: "feeds",
      data: { _id: postId },
      update: { quizId },
      revalidate: "/feeds",
    });

    if (updatedPost.error) {
      throw new Error(updatedPost.error);
    }

    return updatedPost;
  } catch (error) {
    console.error("❌ Error updating post with quiz:", error);
    throw error;
  }
} 