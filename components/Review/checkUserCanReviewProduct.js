import { getAll } from "@/lib/actions/crud";
import { checkUserAlreadyReviewedPost } from "./checkUserAlreadyReviewedPost";

export default async function checkUserCanReviewProduct({ userId, postId }) {
  try {
    // * 1. Check if user has already reviewed this product
    const canReview = await checkUserAlreadyReviewedPost({ userId, postId });
    if (!canReview) {
      return false; // User has already reviewed this product
    }

    // * 2. Check if user has purchased the product
    const orders = await getAll({
      col: "orders",
      data: { userId },
      populate: "items.productId",
    });

    const hasPurchased = orders.some((order) =>
      order.items.some((item) => {
        const matches = item.productId._id.toString() === postId;
        return matches;
      })
    );

    return hasPurchased;
  } catch (error) {
    console.error("Error checking if user can review product:", error);
    return false;
  }
}
