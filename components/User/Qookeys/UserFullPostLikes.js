"use client";

import PostsClientInfiniteScroll from "../../Post/Posts/PostsClientInfiniteScroll";

export default function UserFullPostLikes({
  isAdmin = false,
  mongoUser,
  post,
  className = "",
}) {
  return (
    <div className={`${className}`}>
      <div className="wf title mxa">Likes:</div>
      <PostsClientInfiniteScroll
        {...{
          searchParams: {
            userId: post._id,
            liked: true,
          },
          col: {
            name: "products",
            settings: { hasLikes: true },
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
