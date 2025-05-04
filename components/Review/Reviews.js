"use client";

import useGetReviews from "./useGetReviews";
import PostsClientInfiniteScroll from "../Post/Posts/PostsClientInfiniteScroll";
import { useContext } from "../Context/Context";

export default function Reviews({ post, isAdmin }) {
  const { reviews, loading } = useGetReviews({ postId: post._id });
  const { mongoUser } = useContext();

  if (reviews?.length === 0 && !loading) {
    return <div className="👋 text-gray-500 my15 tac fz14">No reviews yet</div>;
  }

  return (
    <div>
      {reviews.length > 0 && (
        <div className="abounce fw600 t_125 px15 mt15 tac">
          {reviews.length} Review{reviews.length === 1 ? "" : "s"} for{" "}
          {post.title}
        </div>
      )}
      <PostsClientInfiniteScroll
        {...{
          searchParams: {
            postId: post._id,
          },
          col: {
            name: "reviews",
            settings: { noFullPost: true, hasLikes: true },
          },
          isAdmin,
          limit: 2,
          mongoUser,
          showFoundNum: false,
        }}
      />
    </div>
  );
}
