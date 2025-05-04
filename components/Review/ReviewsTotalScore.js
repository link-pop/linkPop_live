import PostsLoader from "../Post/Posts/PostsLoader";
import StarRating from "../ui/shared/StarRating/StarRating";
import useGetReviews from "./useGetReviews";
import { Loader2 } from "lucide-react";

export default function ReviewsTotalScore({ postId }) {
  const { reviews, loading } = useGetReviews({ postId });

  // * loading
  if (loading) {
    return <div className="h20"></div>;
    return <PostsLoader isLoading={loading} className="!h13 !w115 !ml0" />;
  }

  // * no reviews
  if (!reviews?.length) {
    return (
      <div className="h20 abounce text-sm text-gray-500">No reviews yet</div>
    );
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;

  return (
    <div
      className="h20 abounce flex items-center gap-2 wfc cp"
      onClick={() => {
        const reviewSection = document.querySelector(".Reviews");
        reviewSection.click();
        reviewSection.scrollIntoView({ behavior: "smooth" });
      }}
    >
      <StarRating rating={averageRating} readonly size={4} />
      {averageRating > 0 && (
        <span className="text-sm text-gray-600">
          ({averageRating.toFixed(2)})
        </span>
      )}
      -
      <span className="brand tdu text-sm text-gray-600">
        {reviews.length} customer {reviews.length === 1 ? "review" : "reviews"}
      </span>
    </div>
  );
}
