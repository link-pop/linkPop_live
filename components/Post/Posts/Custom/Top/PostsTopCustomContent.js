"use client";

import DirectLinkLandingPagePostsTopCustomContent from "./DirectLinkLandingPagePostsTopCustomContent";
import FeedPostsTopCustomContent from "./FeedPostsTopCustomContent";
import NotificationPostsTopCustomContent from "./NotificationPostsTopCustomContent";
import StoreitemsPostsTopCustomContent from "./StoreitemsPostsTopCustomContent";
import ChatroomsPostsTopCustomContent from "./ChatroomsPostsTopCustomContent";

export default function PostsTopCustomContent({
  col,
  isAdmin,
  mongoUser,
  posts,
  showCategories,
}) {
  return (
    <>
      <FeedPostsTopCustomContent
        {...{ col, posts, showCategories, mongoUser }}
      />
      <NotificationPostsTopCustomContent
        {...{ col, posts, showCategories, mongoUser }}
      />
      <DirectLinkLandingPagePostsTopCustomContent
        {...{ col, posts, showCategories, mongoUser }}
      />
      <StoreitemsPostsTopCustomContent
        {...{ col, posts, showCategories, mongoUser }}
      />
      <ChatroomsPostsTopCustomContent
        {...{ col, posts, showCategories, mongoUser }}
      />
    </>
  );
}
