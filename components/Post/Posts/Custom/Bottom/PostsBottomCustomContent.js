"use client";

export default function PostsBottomCustomContent({
  col,
  isAdmin,
  mongoUser,
  postsFoundNum,
}) {
  // Don't render anything for chatrooms since they have their own dedicated layout
  if (col?.name === "chatrooms") {
    return null;
  }

  return null;
}
