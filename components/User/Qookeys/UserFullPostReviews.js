"use client";

import PostsClientInfiniteScroll from "../../Post/Posts/PostsClientInfiniteScroll";

export default function UserFullPostReviews({
  isAdmin = false,
  mongoUser,
  post,
  className = "",
}) {
  return (
    <div className={`${className}`}>
      <div className="title mxa wf">Reviews:</div>
      <PostsClientInfiniteScroll
        {...{
          searchParams: {
            userId: post._id,
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
