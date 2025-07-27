"use client";

import { useMemo, useState, useEffect, useContext, Suspense } from "react";
import PostLabelsNavigation from "./PostLabelsNavigation";
import PostLabelsDisplay from "./PostLabelsDisplay";
import { getUserPostLabelLists } from "@/lib/actions/getUserPostLabelLists";
import { getUserPostLabels } from "@/lib/actions/getUserPostLabels";
import { getFeedPostsForPostLabelList } from "@/lib/actions/getFeedPostsForPostLabelList";
import PostsLoader from "@/components/Post/Posts/PostsLoader";
import { CollectionsContext } from "@/components/Context/CollectionsContext";

export default function PostLabelsContent({ mongoUser, postLabelListId }) {
  const {
    setMongoUser,
    setRefreshData,
    setCurrentList,
    setRefreshPostLabelLists,
    postLabelViewMode,
  } = useContext(CollectionsContext);
  const [postLabelLists, setPostLabelLists] = useState([]);
  const [allPostLabels, setAllPostLabels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [customListFeedPosts, setCustomListFeedPosts] = useState(null);
  const [isLoadingPostLabels, setIsLoadingPostLabels] = useState(false);

  if (!mongoUser) return null;

  // Define system lists for post label collections
  const systemLists = {
    "all-post-labels": {
      id: "all-post-labels",
      name: "All Post Labels",
      description: "All your labeled posts",
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

      const [postLabelsData, customListsData] = await Promise.all([
        getUserPostLabels(),
        getUserPostLabelLists(), // Get lists for post labels
      ]);

      setAllPostLabels(Array.isArray(postLabelsData) ? postLabelsData : []);
      setPostLabelLists(Array.isArray(customListsData) ? customListsData : []);
    } catch (error) {
      console.error("❌ Error fetching post labels data:", error);
      setAllPostLabels([]);
      setPostLabelLists([]);
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
    if (systemLists[postLabelListId]) {
      return systemLists[postLabelListId];
    }

    // Then check if it's a custom list
    const customList = postLabelLists.find(
      (list) => list.slug === postLabelListId
    );
    if (customList) {
      return {
        id: customList.slug,
        name: customList.name,
        description: customList.description,
        filterCriteria: customList.filterCriteria,
        postLabelIds: customList.postLabelIds, // For post label lists
        isCustom: true,
        _id: customList._id,
        fullData: customList,
      };
    }

    // Fallback to "all-post-labels" if not found
    return systemLists["all-post-labels"];
  }, [postLabelListId, postLabelLists]);

  // Update currentList in context when it changes
  useEffect(() => {
    setCurrentList(currentList);
  }, [currentList, setCurrentList]);

  // Fetch feed posts for custom post label lists
  useEffect(() => {
    async function fetchCustomListFeedPosts() {
      console.log("🔍 PostLabelsContent - fetchCustomListFeedPosts called:", {
        isCustom: currentList.isCustom,
        postLabelIdsLength: currentList.postLabelIds?.length,
        currentListId: currentList.id,
        currentListName: currentList.name,
      });

      if (!currentList.isCustom || !currentList.postLabelIds?.length) {
        console.log("❌ PostLabelsContent - Skipping fetch due to conditions");
        setCustomListFeedPosts([]);
        setIsLoadingPostLabels(false);
        return;
      }

      try {
        setIsLoadingPostLabels(true);

        // Use the new function to fetch feed posts for custom lists
        const feedPosts = await getFeedPostsForPostLabelList(
          currentList.postLabelIds
        );

        setCustomListFeedPosts(Array.isArray(feedPosts) ? feedPosts : []);
      } catch (error) {
        console.error("❌ Error fetching custom list feed posts:", error);
        setCustomListFeedPosts([]);
      } finally {
        setIsLoadingPostLabels(false);
      }
    }

    fetchCustomListFeedPosts();
  }, [currentList.isCustom, JSON.stringify(currentList.postLabelIds)]);

  // Function to refresh post label lists (for when a new list is created or updated)
  const refreshPostLabelLists = async () => {
    try {
      await fetchAllData();

      // If we're currently viewing a custom list, we might need to refresh its feed posts
      const updatedCurrentList = postLabelLists.find(
        (list) => list.slug === postLabelListId
      );
      if (updatedCurrentList && currentList.isCustom) {
        // Trigger re-fetch of custom list feed posts
        setCustomListFeedPosts(null);
        setIsLoadingPostLabels(true);
      }
    } catch (error) {
      console.error("❌ Error refreshing post label lists:", error);
    }
  };

  // Set mongoUser and refreshData in context when component mounts
  useEffect(() => {
    setMongoUser(mongoUser);
    setRefreshData(() => refreshPostLabelLists);
    setRefreshPostLabelLists(() => refreshPostLabelLists);
  }, [mongoUser, setMongoUser, setRefreshData, setRefreshPostLabelLists]);

  if (isLoading) return <PostsLoader isLoading={isLoading} />;

  return (
    <div className="f h-full w-full">
      {/* Left Side Navigation - vertical */}
      <PostLabelsNavigation
        mongoUser={mongoUser}
        currentListId={postLabelListId}
        systemLists={systemLists}
        postLabelLists={postLabelLists}
        refreshPostLabelLists={refreshPostLabelLists}
        allPostLabels={allPostLabels}
      />

      {/* Right Side Content Display */}
      <div className="flex-1 h-full overflow-hidden">
        <Suspense fallback={<PostsLoader isLoading={true} />}>
          <PostLabelsDisplay
            mongoUser={mongoUser}
            currentListId={postLabelListId}
            currentListContext={currentList}
            isLoadingData={isLoadingPostLabels}
            allPostLabels={allPostLabels}
            customListFeedPosts={customListFeedPosts}
            viewMode={postLabelViewMode}
          />
        </Suspense>
      </div>
    </div>
  );
}
