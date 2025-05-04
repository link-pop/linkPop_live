"use client";

import AddReviewForm from "@/components/Review/AddReviewForm";
import Reviews from "@/components/Review/Reviews";

export default function ReviewsHub({ post, col, isAdmin }) {
  return (
    <div className="wf">
      <AddReviewForm {...{ post, col }} />
      <Reviews {...{ post, isAdmin }} />
    </div>
  );
}
