"use client";

import React, { useEffect, useRef, useState } from "react";
import InfiniteScroll from "@/components/ui/infinite-scroll";
import PostsDepOnMongoCollection from "./PostsDepOnMongoCollection";
import { getAllPostsOwner } from "@/lib/actions/getAllPostsOwner";
import PostsLoader from "./PostsLoader";
import useMessagesInfiniteScroll from "@/hooks/useMessagesInfiniteScroll";
import { useChat } from "@/components/Context/ChatContext";

export default function MessagesInfiniteScroll({
  col,
  mongoUser,
  showFoundNum = false,
  limit = 10,
  chatRoomId,
  onReply,
}) {
  const scrollContainerRef = useRef(null);
  const lastScrollHeightRef = useRef(0);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const { replyTo } = useChat();

  // * Set isOwner based on whether the current user is the message creator
  const getAllPostsFn = async (args) => {
    const { data: { chatRoomId: id, ...otherData } = {}, ...otherArgs } = args;
    const now = new Date();

    // * For messages, we need to check if mongoUser is the creator of each message
    return getAllPostsOwner({
      ...otherArgs,
      data: {
        ...otherData,
        chatRoomId: id,
        $or: [
          // * User's own messages - show all (including scheduled)
          {
            $and: [{ createdBy: mongoUser?._id }, { active: { $ne: false } }],
          },
          // * Other's messages - only show non-scheduled and non-expired
          {
            $and: [
              { createdBy: { $ne: mongoUser?._id } },
              { active: { $ne: false } },
              // * Schedule filter - only show if not scheduled or schedule time passed
              {
                $or: [
                  { scheduleAt: { $exists: false } },
                  { scheduleAt: null },
                  { scheduleAt: { $lte: now } },
                ],
              },
            ],
          },
        ],
      },
    });
  };

  const {
    allPosts,
    totalCount,
    hasMore,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    handleScroll,
  } = useMessagesInfiniteScroll({
    getAllPostsFn,
    col,
    mongoUser,
    limit,
    chatRoomId,
  });

  // Function to scroll to bottom
  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
      lastScrollHeightRef.current = scrollContainerRef.current.scrollHeight;
      setHasScrolledToBottom(true);
    }
  };

  // Scroll to bottom when messages first load
  useEffect(() => {
    if (!isLoading && allPosts.length > 0 && !hasScrolledToBottom) {
      scrollToBottom();
    }
  }, [isLoading, allPosts, hasScrolledToBottom]);

  // Preserve scroll position when loading more messages
  useEffect(() => {
    if (
      scrollContainerRef.current &&
      !isFetchingNextPage &&
      allPosts.length > 0
    ) {
      requestAnimationFrame(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const newScrollHeight = container.scrollHeight;
        const oldScrollHeight = lastScrollHeightRef.current;

        if (newScrollHeight > oldScrollHeight) {
          // Calculate how many pixels were added
          const addedHeight = newScrollHeight - oldScrollHeight;

          // Adjust scroll position to keep viewport at the same place
          container.scrollTop = container.scrollTop + addedHeight;
        }

        lastScrollHeightRef.current = newScrollHeight;
      });
    }
  }, [allPosts, isFetchingNextPage]);

  if (isLoading) return <PostsLoader />;

  console.log(
    "All posts:",
    allPosts?.map((post) => post?.chatMsgText)
  );

  return (
    <div
      className={`wf fc ${
        replyTo ? "h-[calc(100dvh-307px)]" : "h-[calc(100dvh-220px)]"
      } oya`}
      ref={scrollContainerRef}
      onScroll={handleScroll}
    >
      <InfiniteScroll
        loading={isFetchingNextPage}
        hasMore={hasMore}
        next={fetchNextPage}
        threshold={0.2}
        reverse={true}
        rootMargin="0px"
        root={scrollContainerRef.current}
      >
        <div className="wf h-full">
          {hasMore && isFetchingNextPage && <PostsLoader className="!mt0" />}

          {showFoundNum && totalCount && (
            <div className="text-center fz14">Found: {totalCount}</div>
          )}

          <PostsDepOnMongoCollection
            posts={allPosts}
            col={col}
            mongoUser={mongoUser}
            onReply={onReply}
          />
        </div>
      </InfiniteScroll>
    </div>
  );
}
