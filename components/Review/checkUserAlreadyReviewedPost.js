import { getAll } from "@/lib/actions/crud";

export const checkUserAlreadyReviewedPost = async ({ userId, postId }) => {
  // Check if user has already reviewed this post
  const existingReviews = await getAll({
    col: "reviews",
    data: {
      createdBy: userId,
      postId,
    },
  });

  if (existingReviews.length > 0) {
    return false; // User has already reviewed this post
  }

  return true;
};

export default checkUserAlreadyReviewedPost;
