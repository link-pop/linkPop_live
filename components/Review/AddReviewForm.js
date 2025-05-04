import { useState } from "react";
import StarRating from "../ui/shared/StarRating/StarRating";
import Textarea from "../ui/shared/Textarea/Textarea";
import { add, update, getAll } from "@/lib/actions/crud";
import { useContext } from "../Context/Context";
import useHandleReview from "./useHandleReview";
import { censorText } from "@/lib/utils/geminiAI";

export default function AddReviewForm({ post, col, updatingPost }) {
  const [rating, setRating] = useState(updatingPost?.rating || 0);
  const [text, setText] = useState(updatingPost?.text || "");
  const [submitting, setSubmitting] = useState(false);
  const { mongoUser, dialogSet } = useContext();
  // updating review (eg article id) || new review (eg article id)
  const reviewingPostId = updatingPost?.postId || post._id;
  const reviewingPostCol = updatingPost?.postCol || col;

  const { canReview, errorText, hasRating } = useHandleReview({
    userId: mongoUser?._id,
    postId: reviewingPostId,
    col: reviewingPostCol,
  });

  async function onSubmit(e) {
    e.preventDefault();

    // * no user
    if (!mongoUser) {
      dialogSet({ isOpen: true, title: "Please sign in to submit a review" });
      return;
    }

    // * no rating
    if (!rating && hasRating) {
      dialogSet({ isOpen: true, title: "Please select a rating" });
      return;
    }

    // * validate review text length
    const minTextLength = 5;
    if (text.trim().length <= minTextLength) {
      dialogSet({
        isOpen: true,
        title: `Review text must be longer than ${minTextLength} characters`,
      });
      return;
    }

    try {
      setSubmitting(true);

      // * 1. check if user can review
      // * 2. allow updating review
      if (!canReview && !updatingPost) {
        dialogSet({
          isOpen: true,
          title: errorText,
        });
        return;
      }

      // * censor text using Gemini AI
      const processedText = await censorText(text);

      const formData = {
        rating,
        text: processedText,
        createdBy: mongoUser._id,
        userId: mongoUser._id,
        postId: reviewingPostId,
        postCol: reviewingPostCol,
        reviewed_collection: reviewingPostCol.name,
      };

      if (!updatingPost) {
        // * add mode
        await add({
          col: "reviews",
          data: formData,
        });
      } else {
        // * update mode
        // ! delete createdBy, to not rewrite it (so admin can edit review)
        delete formData.createdBy;
        await update({
          col: "reviews",
          data: { _id: updatingPost._id },
          update: formData,
        });
      }

      // ! Update product rating
      // Get all reviews for this product to calculate average rating
      const reviews = await getAll({
        col: "reviews",
        data: { postId: reviewingPostId },
      });

      // Calculate average rating
      const totalRating = reviews.reduce(
        (sum, review) => sum + (review.rating || 0),
        0
      );
      const averageRating =
        reviews.length > 0 ? totalRating / reviews.length : 0;

      // Update product rating
      await update({
        col: reviewingPostCol,
        data: { _id: reviewingPostId },
        update: { rating: averageRating },
      });
      // ? Update product rating

      // Clear form
      setRating(0);
      setText("");
      dialogSet({ isOpen: true, title: "Review submitted successfully" });
      window.location.reload();
    } catch (error) {
      console.error("Error submitting review:", error);
      dialogSet({
        isOpen: true,
        title: "Failed to submit review. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="px15 maw740 mxa space-y-4">
      {!updatingPost && (
        <div className="brand mt15 fw600 t_125">Add your review</div>
      )}
      {/* prevent ui shifting */}
      <div className={`${col.name === "products" ? "h20" : ""}`}>
        {hasRating && (
          <StarRating
            className="abounce"
            rating={rating}
            onRatingChange={setRating}
          />
        )}
      </div>
      <Textarea
        name="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write your review here..."
      />
      <div className="fcc g10">
        {/* // * Cancel Update Review button */}
        {updatingPost && (
          <div
            className="btn_ghost"
            onClick={() => dialogSet({ isOpen: false })}
          >
            Cancel
          </div>
        )}
        {/*  // * Submit Review button */}
        <button type="submit" className="btn_brand" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Review"}
        </button>
      </div>
    </form>
  );
}
