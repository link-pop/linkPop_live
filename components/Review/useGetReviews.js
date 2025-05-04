import { getAll } from "@/lib/actions/crud";
import { useEffect, useState } from "react";

export default function useGetReviews({ postId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      try {
        setLoading(true);
        const res = await getAll({
          col: "reviews",
          data: { postId },
        });
        setReviews(res);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, [postId]);

  return { reviews, loading };
}
