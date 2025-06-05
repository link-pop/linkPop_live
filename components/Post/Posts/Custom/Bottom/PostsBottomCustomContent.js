"use client";

import ChatroomsPostsBottomCustomContent from "./ChatroomsPostsBottomCustomContent";

export default function PostsBottomCustomContent({
  col,
  isAdmin,
  mongoUser,
  postsFoundNum,
}) {
  return (
    <>
      <ChatroomsPostsBottomCustomContent
        {...{ col, isAdmin, mongoUser, postsFoundNum }}
      />
    </>
  );
}
