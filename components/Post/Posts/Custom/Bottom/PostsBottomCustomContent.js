"use client";

import ChatroomsPostsBottomCustomContent from "./ChatroomsPostsBottomCustomContent";
import FAQPostsBottomCustomContent from "./FAQPostsBottomCustomContent";
import ProductsArticlesPostsBottomCustomContent from "./ProductsArticlesPostsBottomCustomContent";

export default function PostsBottomCustomContent({
  col,
  isAdmin,
  mongoUser,
  postsFoundNum,
}) {
  return (
    <>
      <FAQPostsBottomCustomContent {...{ col }} />
      <ProductsArticlesPostsBottomCustomContent
        {...{ col, isAdmin, mongoUser, postsFoundNum }}
      />
      <ChatroomsPostsBottomCustomContent
        {...{ col, isAdmin, mongoUser, postsFoundNum }}
      />
    </>
  );
}
