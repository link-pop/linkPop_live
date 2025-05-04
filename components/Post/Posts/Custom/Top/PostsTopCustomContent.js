"use client";

import DirectLinkLandingPagePostsTopCustomContent from "./DirectLinkLandingPagePostsTopCustomContent";
import FeedPostsTopCustomContent from "./FeedPostsTopCustomContent";
import NotificationPostsTopCustomContent from "./NotificationPostsTopCustomContent";
import OrderPostsTopCustomContent from "./OrderPostsTopCustomContent";
import ProductPostsTopCustomContent from "./ProductPostsTopCustomContent";

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
      <OrderPostsTopCustomContent
        {...{ col, posts, showCategories, mongoUser }}
      />
      <ProductPostsTopCustomContent
        {...{ col, posts, showCategories, mongoUser }}
      />
      <DirectLinkLandingPagePostsTopCustomContent
        {...{ col, posts, showCategories, mongoUser }}
      />
    </>
  );
}
