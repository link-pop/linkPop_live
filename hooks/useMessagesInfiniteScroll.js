"use client";

import { useChat } from "@/components/Context/ChatContext";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useRef, useEffect, useState } from "react";
import SOCKET_EVENTS from "@/chatServer/constants/socketEvents";

// Debounce utility
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default function useMessagesInfiniteScroll({
  getAllPostsFn,
  col,
  mongoUser,
  limit = 20,
  chatRoomId,
}) {
  const debouncedFetchRef = useRef();
  const { socket } = useChat();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["chat", "messages", chatRoomId],
    queryFn: async ({ pageParam = 0 }) => {
      console.log("Fetching page:", pageParam);

      // First get total count
      const allPosts =
        pageParam === 0
          ? await getAllPostsFn({
              col,
              mongoUser,
              data: { chatRoomId },
            })
          : null;

      // Then get paginated posts with proper sort
      const posts = await getAllPostsFn({
        col,
        skip: limit * pageParam,
        limit,
        mongoUser,
        data: { chatRoomId },
        sort: { createdAt: -1 }, // Ensure consistent sorting
      });

      return {
        posts,
        totalCount: allPosts?.length,
        pageParam,
      };
    },
    getNextPageParam: (lastPage, allPages) => {
      const totalCount = lastPage.totalCount || allPages[0]?.totalCount;
      if (!totalCount) return undefined;

      const totalFetched = allPages.reduce(
        (total, page) => total + page.posts.length,
        0
      );

      console.log(
        "Total fetched:",
        totalFetched,
        "Total available:",
        totalCount
      );

      if (totalFetched >= totalCount) {
        console.log("No more pages");
        return undefined;
      }

      return lastPage.pageParam + 1;
    },
    initialPageParam: 0,
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });

  // Initialize debounced fetch function
  if (!debouncedFetchRef.current) {
    debouncedFetchRef.current = debounce(() => {
      console.log("Near top, fetching next page (debounced)");
      fetchNextPage();
    }, 200);
  }

  // Socket event listeners for real-time updates
  useEffect(() => {
    if (!socket || !chatRoomId) return;

    // Listen for message deletion
    const handleMessageDelete = ({ messageId }) => {
      console.log("Message deleted:", messageId);
      refetch(); // Refetch to update the messages list
    };

    // Listen for message hiding
    const handleMessageHide = ({ messageId }) => {
      console.log("Message hidden:", messageId);
      refetch(); // Refetch to update the messages list
    };

    socket.on(SOCKET_EVENTS.CHAT.MESSAGE.DELETED(chatRoomId), handleMessageDelete);

    socket.on(SOCKET_EVENTS.CHAT.MESSAGE.HIDDEN(chatRoomId), handleMessageHide);

    return () => {
      socket.off(SOCKET_EVENTS.CHAT.MESSAGE.DELETED(chatRoomId));
      socket.off(SOCKET_EVENTS.CHAT.MESSAGE.HIDDEN(chatRoomId));
    };
  }, [chatRoomId, refetch, socket]);

  // Handle scroll events with debounce
  const handleScroll = useCallback((e) => {
    const { scrollTop } = e.target;
    const isTopReached = scrollTop < 100;

    if (isTopReached && debouncedFetchRef.current) {
      debouncedFetchRef.current();
    }
  }, []);

  // Get posts in chronological order (oldest to newest)
  const allPosts =
    data?.pages
      ?.map((page) => page?.posts || [])
      .flat()
      .reverse() || [];

  const totalCount = data?.pages?.[0]?.totalCount;
  const hasMore = Boolean(hasNextPage);

  return {
    allPosts,
    totalCount,
    hasMore,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    handleScroll,
  };
}
