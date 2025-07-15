"use client";

import { useState, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getAllPostsOwner } from "@/lib/actions/getAllPostsOwner";
import PostsLoader from "@/components/Post/Posts/PostsLoader";
import ChatroomsSendUserItem from "./ChatroomsSendUserItem";
import InfiniteScroll from "@/components/ui/infinite-scroll";
import { useTranslation } from "@/components/Context/TranslationContext";
import Button2 from "../ui/shared/Button/Button2";
import SearchInput from "@/components/ui/shared/SearchInput/SearchInput";

// * Component that shows list of users from existing chatrooms for mass messaging
export default function ChatroomsSendChatroomsList({
  mongoUser,
  isAdmin,
  searchParams,
  selectedUsers,
  onUserSelect,
}) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState(searchParams?.q || "");
  const limit = 20;

  // Update search query when URL params change
  useEffect(() => {
    setSearchQuery(searchParams?.q || "");
  }, [searchParams?.q]);

  const {
    data: chatroomsFetchedData,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["massMessage", "chatrooms", searchQuery],
    queryFn: async ({ pageParam = 0 }) => {
      const col = {
        name: "chatrooms",
        settings: {},
      };

      // Use the same data filter as regular chatrooms list
      let data = { chatRoomUsers: mongoUser._id };

      // If there's a search query, add search filter
      if (searchQuery && searchQuery.trim()) {
        // For now, we'll get all chatrooms and filter client-side
      }

      const chatrooms = await getAllPostsOwner({
        data,
        col,
        skip: limit * pageParam,
        limit: limit * 2, // Fetch more chatrooms to account for filtering
        searchParams: searchQuery ? { q: searchQuery } : {},
        mongoUser,
      });

      // Extract users from chatrooms (excluding current user)
      const users = chatrooms
        .map((chatroom) => {
          const otherUser = chatroom.chatRoomUsers?.find(
            (user) => user._id.toString() !== mongoUser._id.toString()
          );
          return otherUser;
        })
        .filter(Boolean)
        .filter((user, index, self) => {
          // Remove duplicates by user ID
          return (
            index ===
            self.findIndex((u) => u._id.toString() === user._id.toString())
          );
        });

      // Client-side search filtering if query exists
      const filteredUsers =
        searchQuery && searchQuery.trim()
          ? users.filter((user) => {
              const query = searchQuery.toLowerCase();
              return (
                user.name?.toLowerCase().includes(query) ||
                user.username?.toLowerCase().includes(query) ||
                user.displayName?.toLowerCase().includes(query)
              );
            })
          : users;

      return {
        users: filteredUsers,
        pageParam,
        originalChatroomsCount: chatrooms.length,
      };
    },
    getNextPageParam: (lastPage) => {
      // Check if we got the expected number of chatrooms (before filtering)
      // This indicates there might be more chatrooms available
      const hasMore = lastPage.originalChatroomsCount >= limit * 2;
      return hasMore ? lastPage.pageParam + 1 : undefined;
    },
    initialPageParam: 0,
    refetchOnWindowFocus: false,
    enabled: true,
    staleTime: 0, // No cache for chatroom search
  });

  const users = chatroomsFetchedData?.pages.flatMap((page) => page.users) ?? [];
  const hasMore = Boolean(hasNextPage);

  const handleUserToggle = (user) => {
    const isSelected = selectedUsers.some((u) => u._id === user._id);
    onUserSelect(user, !isSelected);
  };

  const handleSelectAll = () => {
    // Select all users that are not already selected
    users.forEach((user) => {
      const isSelected = selectedUsers.some((u) => u._id === user._id);
      if (!isSelected) {
        onUserSelect(user, true);
      }
    });
  };

  const handleDeselectAll = () => {
    // Deselect all users that are currently selected
    users.forEach((user) => {
      const isSelected = selectedUsers.some((u) => u._id === user._id);
      if (isSelected) {
        onUserSelect(user, false);
      }
    });
  };

  const allUsersSelected =
    users.length > 0 &&
    users.every((user) => selectedUsers.some((u) => u._id === user._id));

  return (
    <div className="h-full flex flex-col border border-border">
      <div className="p-3 border-b">
        <div className="text-sm font-medium mb10 pl2">
          {t("selectUsersToSendMessage")} ({selectedUsers.length})
        </div>
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={() => setSearchQuery("")}
          placeholder={t("search")}
          className="mb-2"
        />
        {users.length > 0 && (
          <div className="mla wfc flex gap-2">
            <Button2
              variant="ghost"
              text={allUsersSelected ? t("deselectAll") : t("selectAll")}
              onClick={allUsersSelected ? handleDeselectAll : handleSelectAll}
              className="text-xs h-8 px-3"
            />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading && users.length === 0 ? (
          <div className="p-4">
            <PostsLoader isLoading={true} />
          </div>
        ) : users.length === 0 ? (
          <div className="p-4 text-center text-sm text-foreground/60">
            {searchQuery ? t("noUsersFound") : t("noUsersFound")}
          </div>
        ) : (
          <InfiniteScroll
            hasMore={hasMore}
            loading={isFetching}
            next={fetchNextPage}
            threshold={1}
          >
            <div className="divide-y">
              {users.map((user) => (
                <ChatroomsSendUserItem
                  key={user._id}
                  user={user}
                  isSelected={selectedUsers.some((u) => u._id === user._id)}
                  onToggle={() => handleUserToggle(user)}
                />
              ))}
            </div>
          </InfiniteScroll>
        )}
      </div>
    </div>
  );
}
