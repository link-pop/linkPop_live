"use client";

import React from "react";
import InfiniteScroll from "@/components/ui/infinite-scroll";
import PostsDepOnMongoCollection from "./PostsDepOnMongoCollection";
import { getAllPostsNonOwner } from "@/lib/actions/getAllPostsNonOwner";
import { getAllPostsOwner } from "@/lib/actions/getAllPostsOwner";
import { useInfiniteQuery } from "@tanstack/react-query";
import PostsLoader from "./PostsLoader";

export default function PostsClientInfiniteScroll({
  data = {},
  isOwner = false,
  postsPaginationType = "infinite",
  col,
  isAdmin,
  searchParams,
  limit = 9,
  mongoUser,
  className = `fcc g10 my15 container aistr ${
    ["someColName1", "someColName2"].includes(col.name)
      ? ""
      : col.name === "feeds"
      ? "!jcs !maw600 !p0 !m0"
      : ""
  }`,
  showFoundNum = false,
  showCategories = true,
  sort,
  scrollLTR = false,
  loadPostsOnce = false,
  top,
  setCommentTextState,
  customPostsComponent,
}) {
  const getAllPostsFn = isOwner ? getAllPostsOwner : getAllPostsNonOwner;

  const {
    data: postsFetchedData,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["posts", col.name, { searchParams }],
    queryFn: async ({ pageParam = 0 }) => {
      const [posts, totalPosts] = await Promise.all([
        getAllPostsFn({
          data,
          col,
          skip: limit * pageParam,
          limit,
          searchParams,
          mongoUser,
          populate:
            col?.name === "orders"
              ? ["items.productId", "createdBy"]
              : undefined,
          sort,
        }),
        getAllPostsFn({
          data,
          col,
          searchParams,
          mongoUser,
        }),
      ]);
      return { posts, totalPosts: totalPosts.length, pageParam };
    },
    getNextPageParam: (lastPage) => {
      const hasMore = lastPage.posts.length === limit;
      return hasMore ? lastPage.pageParam + 1 : undefined;
    },
    initialPageParam: 0,
    refetchOnWindowFocus: true,
    enabled: Boolean(col),
    staleTime: 0, // Always refetch when parameters change
  });

  const posts = postsFetchedData?.pages.flatMap((page) => page.posts) ?? [];
  const postsFoundNum = postsFetchedData?.pages[0]?.totalPosts ?? 0;
  const hasMore = Boolean(hasNextPage);
  const isChatrooms = col?.name === "chatrooms";

  return (
    <>
      {top && !isLoading && top}
      {!isChatrooms && <PostsLoader {...{ isLoading }} />}

      {customPostsComponent ? (
        // Use custom component to render posts if provided
        customPostsComponent({
          posts,
          postsFoundNum,
          hasMore,
          isLoading,
          isFetching,
        })
      ) : (
        // Otherwise use default PostsDepOnMongoCollection
        <PostsDepOnMongoCollection
          {...{
            posts,
            postsFoundNum,
            col,
            isAdmin,
            postsPaginationType,
            hasMore,
            mongoUser,
            className: `${className} ${scrollLTR ? "!flex-row fwn" : ""}`,
            searchParams,
            showFoundNum,
            showCategories,
            isLoading,
            setCommentTextState,
          }}
        />
      )}

      <InfiniteScroll
        {...{
          hasMore,
          next: fetchNextPage,
          loading: isFetching,
          threshold: 1,
          horizontal: scrollLTR,
        }}
      >
        {hasMore && !loadPostsOnce && (
          <div className="wf">
            {/* // ! don't delete above className="wf" => posts won't load */}
            {!isChatrooms && (
              <PostsLoader {...{ isLoading: isFetching, className: "!mt0" }} />
            )}
          </div>
        )}
      </InfiniteScroll>
    </>
  );
}
