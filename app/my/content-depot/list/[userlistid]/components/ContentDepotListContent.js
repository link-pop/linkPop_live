"use client";

import { useMemo, useState, useEffect, useContext } from "react";
import ContentDepotListNavigation from "./ContentDepotListNavigation";
import ContentDepotMediaDisplay from "./ContentDepotMediaDisplay";
import { getUserLists } from "@/lib/actions/getUserLists";
import { getAll } from "@/lib/actions/crud";
import mongoose from "mongoose";
import PostsLoader from "@/components/Post/Posts/PostsLoader";
import { ContentDepotContext } from "@/components/Context/ContentDepotContext";

export default function ContentDepotListContent({ mongoUser, userListId }) {
  const { setMongoUser, setRefreshUserLists, setCurrentList } =
    useContext(ContentDepotContext);
  const [userLists, setUserLists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [customListAttachments, setCustomListAttachments] = useState(null);
  const [isLoadingAttachments, setIsLoadingAttachments] = useState(false);

  if (!mongoUser) return null;

  // Define system lists - only the main content categories as requested
  const systemLists = {
    all: {
      id: "all",
      name: "All Media",
      uploadedFrom: null, // Show all
      fileType: null,
    },
    feeds: {
      id: "feeds",
      name: "Posts",
      uploadedFrom: "feeds",
      fileType: null,
    },
    chatmessages: {
      id: "chatmessages",
      name: "Messages",
      uploadedFrom: "chatmessages",
      fileType: null,
    },
    welcomeMessage: {
      id: "welcomeMessage",
      name: "Welcome",
      uploadedFrom: "welcomeMessage",
      fileType: null,
    },
  };

  // Fetch custom user lists
  useEffect(() => {
    async function fetchUserLists() {
      if (!mongoUser?._id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const lists = await getUserLists();
        setUserLists(Array.isArray(lists) ? lists : []);
      } catch (error) {
        console.error("❌ Error fetching user lists:", error);
        setUserLists([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserLists();
  }, [mongoUser?._id]);

  // Get the current list configuration (system or custom)
  const currentList = useMemo(() => {
    // First check if it's a system list
    if (systemLists[userListId]) {
      return systemLists[userListId];
    }

    // Then check if it's a custom list
    const customList = userLists.find((list) => list.slug === userListId);
    if (customList) {
      return {
        id: customList.slug,
        name: customList.name,
        filterCriteria: customList.filterCriteria,
        attachmentIds: customList.attachmentIds, // Include attachmentIds for filtering
        isCustom: true,
        _id: customList._id, // Include the MongoDB ID for operations
        fullData: customList, // Include full data for dropdown operations
      };
    }

    // Fallback to "all" if not found
    return systemLists.all;
  }, [userListId, userLists]);

  // Fetch attachments for custom lists
  useEffect(() => {
    async function fetchCustomListAttachments() {
      if (!currentList.isCustom || !currentList.attachmentIds?.length) {
        setCustomListAttachments([]);
        setIsLoadingAttachments(false);
        return;
      }

      try {
        setIsLoadingAttachments(true);

        // Convert attachment IDs to ObjectIds and fetch the actual attachment objects
        const objectIds = currentList.attachmentIds.map(
          (post) => new mongoose.Types.ObjectId(post._id)
        );

        if (objectIds.length === 0) {
          setCustomListAttachments([]);
          return;
        }

        const attachments = await getAll({
          col: "attachments",
          data: {
            _id: { $in: objectIds },
            createdBy: String(mongoUser?._id),
          },
          sort: { createdAt: -1 },
        });

        setCustomListAttachments(Array.isArray(attachments) ? attachments : []);
      } catch (error) {
        console.error("❌ Error fetching custom list attachments:", error);
        setCustomListAttachments([]);
      } finally {
        setIsLoadingAttachments(false);
      }
    }

    fetchCustomListAttachments();
  }, [
    currentList.isCustom,
    JSON.stringify(currentList.attachmentIds),
    mongoUser?._id,
  ]);

  // Build custom search params object that matches what UserFullPostUserMedia expects
  const customSearchParamsObject = useMemo(() => {
    // For custom lists, we don't use search params since we have pre-fetched attachments
    if (currentList.isCustom) {
      return null;
    }

    // ! Don't build search params if we're still loading user lists and the current list is not found
    if (
      isLoading &&
      currentList.id === "all" &&
      userListId !== "all" &&
      !Object.keys(systemLists).includes(userListId)
    ) {
      console.log("🔍 Still loading user lists, waiting...");
      return null;
    }

    let result = {
      createdBy: mongoUser._id,
    };

    // Handle system lists
    if (currentList.uploadedFrom) {
      result.uploadedFrom = currentList.uploadedFrom;
    }

    if (currentList.fileType) {
      result.fileType = currentList.fileType;

      if (currentList.excludeGifs) {
        result.fileUrl_not_contains = ".gif";
      }

      if (currentList.onlyGifs) {
        result.fileUrl_contains = ".gif";
      }
    }

    return result;
  }, [currentList, mongoUser._id, isLoading, userListId]);

  // In the content depot, the user is always the owner
  const isOwner = mongoUser.isOwner !== undefined ? mongoUser.isOwner : true;

  // Function to refresh user lists (for when a new list is created)
  const refreshUserLists = async () => {
    try {
      const lists = await getUserLists();
      setUserLists(Array.isArray(lists) ? lists : []);
    } catch (error) {
      console.error("❌ Error refreshing user lists:", error);
    }
  };

  // Set mongoUser, refreshUserLists, and currentList in context when component mounts
  useEffect(() => {
    setMongoUser(mongoUser);
    setRefreshUserLists(() => refreshUserLists);
    setCurrentList(currentList);
  }, [mongoUser, setMongoUser, setRefreshUserLists, setCurrentList, currentList]);

  // ! currently this loader prevents showing all attachments from ALL USERS, for some short period of time!
  if (isLoading) return <PostsLoader isLoading={isLoading} />;

  return (
    <div className="f h-full w-full">
      {/* Left Side Navigation - vertical */}
      <ContentDepotListNavigation
        mongoUser={mongoUser}
        currentListId={userListId}
        systemLists={systemLists}
        userLists={userLists}
        refreshUserLists={refreshUserLists}
      />

      {/* Right Side Content Display */}
      <div className="flex-1 h-full overflow-hidden">
        <ContentDepotMediaDisplay
          posts={currentList.isCustom ? customListAttachments : null}
          mongoUser={mongoUser}
          currentListId={userListId}
          searchParamsObject={customSearchParamsObject}
          isOwner={isOwner}
          currentListContext={currentList}
          isLoadingCustomList={isLoadingAttachments}
        />
      </div>
    </div>
  );
}
