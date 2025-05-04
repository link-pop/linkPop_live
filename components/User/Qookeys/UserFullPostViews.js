"use client";

import PostsClientInfiniteScroll from "../../Post/Posts/PostsClientInfiniteScroll";

export default function UserFullPostViews({
  isAdmin = false,
  mongoUser,
  post,
  className = "",
}) {
  return (
    <div className={`${className}`}>
      <div className="wf title mxa">Views:</div>
      <PostsClientInfiniteScroll
        {...{
          searchParams: {
            userId: post._id,
            viewed: true,
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
