import { useEffect, useState } from "react";
import checkUserAlreadyReviewedPost from "./checkUserAlreadyReviewedPost";
import checkUserCanReviewProduct from "./checkUserCanReviewProduct";

export default function useHandleReview({ userId, postId, col }) {
  const [canReview, setCanReview] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [hasRating, setHasRating] = useState(false);

  useEffect(() => {
    async function getCanReview() {
      // * products
      if (col.name === "products") {
        const canReview = await checkUserCanReviewProduct({ userId, postId });
        setCanReview(canReview);
        setErrorText("You can only review a product once after purchasing it");
        setHasRating(true);
        // * articles
      } else if (col.name === "articles") {
        const canReview = await checkUserAlreadyReviewedPost({
          userId,
          postId,
        });
        setCanReview(canReview);
        setErrorText("You can only review an article once");
        // * other posts
      } else {
        const canReview = await checkUserAlreadyReviewedPost({
          userId,
          postId,
        });
        setCanReview(canReview);
        setErrorText("You can only review a post once");
      }
    }

    getCanReview();
  }, [userId, postId, col]);

  return { canReview, errorText, hasRating };
}
