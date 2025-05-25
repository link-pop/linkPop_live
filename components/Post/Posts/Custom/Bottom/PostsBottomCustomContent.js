"use client";

import ChatroomsPostsBottomCustomContent from "./ChatroomsPostsBottomCustomContent";
import ProductsArticlesPostsBottomCustomContent from "./ProductsArticlesPostsBottomCustomContent";

export default function PostsBottomCustomContent({
  col,
  isAdmin,
  mongoUser,
  postsFoundNum,
}) {
  return (
    <>
      <ProductsArticlesPostsBottomCustomContent
        {...{ col, isAdmin, mongoUser, postsFoundNum }}
      />
      <ChatroomsPostsBottomCustomContent
        {...{ col, isAdmin, mongoUser, postsFoundNum }}
      />
    </>
  );
}
