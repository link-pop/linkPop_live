"use client";

import DirectLinkLandingPagePostsTopCustomContent from "./DirectLinkLandingPagePostsTopCustomContent";
import FeedPostsTopCustomContent from "./FeedPostsTopCustomContent";
import NotificationPostsTopCustomContent from "./NotificationPostsTopCustomContent";
import StoreitemsPostsTopCustomContent from "./StoreitemsPostsTopCustomContent";

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
    </>
  );
}
