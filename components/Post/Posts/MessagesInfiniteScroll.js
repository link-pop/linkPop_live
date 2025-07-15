"use client";

import React, { useEffect, useRef, useState } from "react";
import InfiniteScroll from "@/components/ui/infinite-scroll";
import PostsDepOnMongoCollection from "./PostsDepOnMongoCollection";
import MessagesWithDateSeparators from "./MessagesWithDateSeparators";
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
  searchQuery,
}) {
  const scrollContainerRef = useRef(null);
  const lastScrollHeightRef = useRef(0);
  const lastPostsLengthRef = useRef(0);
  const scrollPositionRef = useRef({ scrollTop: 0, scrollHeight: 0 });
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const { replyTo } = useChat();

  // * Set isOwner based on whether the current user is the message creator
  const getAllPostsFn = async (args) => {
    const { data: { chatRoomId: id, ...otherData } = {}, ...otherArgs } = args;
    const now = new Date();

    // Build base data object
    let baseData = {
      ...otherData,
      chatRoomId: id,
    };

    // Add search filter if search query is provided
    if (searchQuery && searchQuery.trim()) {
      const trimmedQuery = searchQuery.trim();
      // Escape special regex characters to prevent regex injection
      const escapedQuery = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      baseData.chatMsgText = { $regex: escapedQuery, $options: "i" };
    }

    // * For messages, we need to check if mongoUser is the creator of each message
    return getAllPostsOwner({
      ...otherArgs,
      data: {
        ...baseData,
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
    searchQuery,
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

  // Save scroll position before fetching
  useEffect(() => {
    if (isFetchingNextPage && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      scrollPositionRef.current = {
        scrollTop: container.scrollTop,
        scrollHeight: container.scrollHeight,
      };
    }
  }, [isFetchingNextPage]);

  // Preserve scroll position when loading more messages
  useEffect(() => {
    if (
      scrollContainerRef.current &&
      allPosts.length > 0 &&
      !isFetchingNextPage
    ) {
      const container = scrollContainerRef.current;
      if (!container) return;

      const currentPostsLength = allPosts.length;
      const previousPostsLength = lastPostsLengthRef.current;

      // Only adjust scroll if new posts were added (length increased) and we were fetching
      if (currentPostsLength > previousPostsLength && previousPostsLength > 0) {
        // Use setTimeout instead of requestAnimationFrame for better reliability
        setTimeout(() => {
          const newScrollHeight = container.scrollHeight;
          const { scrollTop: oldScrollTop, scrollHeight: oldScrollHeight } =
            scrollPositionRef.current;

          if (newScrollHeight > oldScrollHeight && oldScrollHeight > 0) {
            // Check if user was not at the bottom when fetch started
            const wasNearBottom =
              oldScrollTop + container.clientHeight >= oldScrollHeight - 100;

            if (!wasNearBottom) {
              // Calculate how much content was added
              const addedHeight = newScrollHeight - oldScrollHeight;

              // Maintain the same relative position by adding the new content height
              container.scrollTop = oldScrollTop + addedHeight;
            }
          }

          lastScrollHeightRef.current = newScrollHeight;
        }, 50); // Small delay to ensure DOM is fully updated
      }

      lastPostsLengthRef.current = currentPostsLength;
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

          <MessagesWithDateSeparators
            posts={allPosts}
            col={col}
            mongoUser={mongoUser}
            onReply={onReply}
            searchQuery={searchQuery}
          />
        </div>
      </InfiniteScroll>
    </div>
  );
}
