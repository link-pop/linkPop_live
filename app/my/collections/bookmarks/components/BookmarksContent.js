"use client";

import { useMemo, useState, useEffect, useContext, Suspense } from "react";
import BookmarksNavigation from "./BookmarksNavigation";
import BookmarksDisplay from "./BookmarksDisplay";
import { getUserCustomLists } from "@/lib/actions/getUserCustomLists";
import { getUserBookmarks } from "@/lib/actions/getUserBookmarks";
import { getFeedPostsForBookmarkList } from "@/lib/actions/getFeedPostsForBookmarkList";
import PostsLoader from "@/components/Post/Posts/PostsLoader";
import { CollectionsContext } from "@/components/Context/CollectionsContext";

export default function BookmarksContent({ mongoUser, bookmarkListId }) {
  const {
    setMongoUser,
    setRefreshData,
    setCurrentList,
    setRefreshBookmarkLists,
    bookmarkViewMode,
  } = useContext(CollectionsContext);
  const [bookmarkLists, setBookmarkLists] = useState([]);
  const [allBookmarks, setAllBookmarks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [customListFeedPosts, setCustomListFeedPosts] = useState(null);
  const [isLoadingBookmarks, setIsLoadingBookmarks] = useState(false);

  if (!mongoUser) return null;

  // Define system lists for bookmark collections
  const systemLists = {
    "all-bookmarks": {
      id: "all-bookmarks",
      name: "All Bookmarks",
      description: "All your bookmarked posts",
    },
  };

  // Fetch all data
  const fetchAllData = async () => {
    if (!mongoUser?._id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const [bookmarksData, customListsData] = await Promise.all([
        getUserBookmarks(),
        getUserCustomLists("bookmarks"), // Get lists for bookmarks
      ]);

      setAllBookmarks(Array.isArray(bookmarksData) ? bookmarksData : []);
      setBookmarkLists(Array.isArray(customListsData) ? customListsData : []);
    } catch (error) {
      console.error("❌ Error fetching bookmarks data:", error);
      setAllBookmarks([]);
      setBookmarkLists([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchAllData();
  }, [mongoUser?._id]);

  // Get the current list configuration (system or custom)
  const currentList = useMemo(() => {
    // First check if it's a system list
    if (systemLists[bookmarkListId]) {
      return systemLists[bookmarkListId];
    }

    // Then check if it's a custom list
    const customList = bookmarkLists.find(
      (list) => list.slug === bookmarkListId
    );
    if (customList) {
      return {
        id: customList.slug,
        name: customList.name,
        description: customList.description,
        filterCriteria: customList.filterCriteria,
        bookmarkIds: customList.bookmarkIds, // For bookmark lists
        isCustom: true,
        _id: customList._id,
        fullData: customList,
      };
    }

    // Fallback to "all-bookmarks" if not found
    return systemLists["all-bookmarks"];
  }, [bookmarkListId, bookmarkLists]);

  // Update currentList in context when it changes
  useEffect(() => {
    setCurrentList(currentList);
  }, [currentList, setCurrentList]);

  // Fetch feed posts for custom bookmark lists
  useEffect(() => {
    async function fetchCustomListFeedPosts() {
      console.log("🔍 BookmarksContent - fetchCustomListFeedPosts called:", {
        isCustom: currentList.isCustom,
        bookmarkIdsLength: currentList.bookmarkIds?.length,
        currentListId: currentList.id,
        currentListName: currentList.name,
      });

      if (!currentList.isCustom || !currentList.bookmarkIds?.length) {
        console.log("❌ BookmarksContent - Skipping fetch due to conditions");
        setCustomListFeedPosts([]);
        setIsLoadingBookmarks(false);
        return;
      }

      try {
        setIsLoadingBookmarks(true);

        console.log(
          "🔍 BookmarksContent - Calling getFeedPostsForBookmarkList with:",
          currentList.bookmarkIds
        );

        // Use the new function to fetch feed posts for custom lists
        const feedPosts = await getFeedPostsForBookmarkList(
          currentList.bookmarkIds
        );

        console.log(
          "🔍 BookmarksContent - Got feed posts:",
          feedPosts?.length || 0
        );

        setCustomListFeedPosts(Array.isArray(feedPosts) ? feedPosts : []);
      } catch (error) {
        console.error("❌ Error fetching custom list feed posts:", error);
        setCustomListFeedPosts([]);
      } finally {
        setIsLoadingBookmarks(false);
      }
    }

    fetchCustomListFeedPosts();
  }, [currentList.isCustom, JSON.stringify(currentList.bookmarkIds)]);

  // Function to refresh bookmark lists (for when a new list is created or updated)
  const refreshBookmarkLists = async () => {
    try {
      await fetchAllData();

      // If we're currently viewing a custom list, we might need to refresh its feed posts
      const updatedCurrentList = bookmarkLists.find(
        (list) => list.slug === bookmarkListId
      );
      if (updatedCurrentList && currentList.isCustom) {
        // Trigger re-fetch of custom list feed posts
        setCustomListFeedPosts(null);
        setIsLoadingBookmarks(true);
      }
    } catch (error) {
      console.error("❌ Error refreshing bookmark lists:", error);
    }
  };

  // Set mongoUser and refreshData in context when component mounts
  useEffect(() => {
    setMongoUser(mongoUser);
    setRefreshData(() => refreshBookmarkLists);
    setRefreshBookmarkLists(() => refreshBookmarkLists);
  }, [mongoUser, setMongoUser, setRefreshData, setRefreshBookmarkLists]);

  if (isLoading) return <PostsLoader isLoading={isLoading} />;

  return (
    <div className="f h-full w-full">
      {/* Left Side Navigation - vertical */}
      <BookmarksNavigation
        mongoUser={mongoUser}
        currentListId={bookmarkListId}
        systemLists={systemLists}
        bookmarkLists={bookmarkLists}
        refreshBookmarkLists={refreshBookmarkLists}
        allBookmarks={allBookmarks}
      />

      {/* Right Side Content Display */}
      <div className="flex-1 h-full overflow-hidden">
        <Suspense fallback={<PostsLoader isLoading={true} />}>
          <BookmarksDisplay
            mongoUser={mongoUser}
            currentListId={bookmarkListId}
            currentListContext={currentList}
            isLoadingData={isLoadingBookmarks}
            allBookmarks={allBookmarks}
            customListFeedPosts={customListFeedPosts}
            viewMode={bookmarkViewMode}
          />
        </Suspense>
      </div>
    </div>
  );
}
