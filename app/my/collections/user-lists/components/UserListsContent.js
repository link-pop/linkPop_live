"use client";

import { useMemo, useState, useEffect, useContext } from "react";
import UserListsNavigation from "./UserListsNavigation";
import UserListsDisplay from "./UserListsDisplay";
import { getUserCustomLists } from "@/lib/actions/getUserCustomLists";
import { getSubscriptions } from "@/lib/actions/getSubscriptions";
import { getSubscribers } from "@/lib/actions/getSubscribers";
import { getUsersForCustomList } from "@/lib/actions/getUsersForCustomList";
import PostsLoader from "@/components/Post/Posts/PostsLoader";
import { CollectionsContext } from "@/components/Context/CollectionsContext";

export default function UserListsContent({ mongoUser, userListId }) {
  const { setMongoUser, setRefreshData, setCurrentList, setRefreshUserLists } =
    useContext(CollectionsContext);
  const [userLists, setUserLists] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [customListUsers, setCustomListUsers] = useState(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  if (!mongoUser) return null;

  // Define system lists for user collections
  const systemLists = {
    subscriptions: {
      id: "subscriptions",
      name: "Subscriptions",
      description: "Users you subscribe to",
    },
    subscribers: {
      id: "subscribers",
      name: "Subscribers",
      description: "Users who subscribe to you",
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

      const [subscriptionsData, subscribersData, customListsData] =
        await Promise.all([
          getSubscriptions(),
          getSubscribers(),
          getUserCustomLists(),
        ]);

      setSubscriptions(
        Array.isArray(subscriptionsData) ? subscriptionsData : []
      );
      setSubscribers(Array.isArray(subscribersData) ? subscribersData : []);
      setUserLists(Array.isArray(customListsData) ? customListsData : []);
    } catch (error) {
      console.error("❌ Error fetching user lists data:", error);
      setSubscriptions([]);
      setSubscribers([]);
      setUserLists([]);
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
    if (systemLists[userListId]) {
      return systemLists[userListId];
    }

    // Then check if it's a custom list
    const customList = userLists.find((list) => list.slug === userListId);
    if (customList) {
      return {
        id: customList.slug,
        name: customList.name,
        description: customList.description,
        filterCriteria: customList.filterCriteria,
        userIds: customList.userIds, // For user lists instead of attachmentIds
        isCustom: true,
        _id: customList._id,
        fullData: customList,
      };
    }

    // Fallback to "subscriptions" if not found
    return systemLists.subscriptions;
  }, [userListId, userLists]);

  // Update currentList in context when it changes
  useEffect(() => {
    setCurrentList(currentList);
  }, [currentList, setCurrentList]);

  // Fetch users for custom lists
  useEffect(() => {
    async function fetchCustomListUsers() {
      if (!currentList.isCustom || !currentList.userIds?.length) {
        setCustomListUsers([]);
        setIsLoadingUsers(false);
        return;
      }

      try {
        setIsLoadingUsers(true);

        // Use the new function to fetch users for custom lists
        const users = await getUsersForCustomList(currentList.userIds);

        setCustomListUsers(Array.isArray(users) ? users : []);
      } catch (error) {
        console.error("❌ Error fetching custom list users:", error);
        setCustomListUsers([]);
      } finally {
        setIsLoadingUsers(false);
      }
    }

    fetchCustomListUsers();
  }, [currentList.isCustom, JSON.stringify(currentList.userIds)]);

  // Function to refresh user lists (for when a new list is created or updated)
  const refreshUserLists = async () => {
    try {
      await fetchAllData();

      // If we're currently viewing a custom list, we might need to refresh its users
      const updatedCurrentList = userLists.find(
        (list) => list.slug === userListId
      );
      if (updatedCurrentList && currentList.isCustom) {
        // Trigger re-fetch of custom list users
        setCustomListUsers(null);
        setIsLoadingUsers(true);
      }
    } catch (error) {
      console.error("❌ Error refreshing user lists:", error);
    }
  };

  // Set mongoUser and refreshData in context when component mounts
  useEffect(() => {
    setMongoUser(mongoUser);
    setRefreshData(() => refreshUserLists);
    setRefreshUserLists(() => refreshUserLists);
  }, [mongoUser, setMongoUser, setRefreshData, setRefreshUserLists]);

  if (isLoading) return <PostsLoader isLoading={isLoading} />;

  return (
    <div className="f h-full w-full">
      {/* Left Side Navigation - vertical */}
      <UserListsNavigation
        mongoUser={mongoUser}
        currentListId={userListId}
        systemLists={systemLists}
        userLists={userLists}
        refreshUserLists={refreshUserLists}
        subscriptions={subscriptions}
        subscribers={subscribers}
      />

      {/* Right Side Content Display */}
      <div className="flex-1 h-full overflow-hidden">
        <UserListsDisplay
          mongoUser={mongoUser}
          currentListId={userListId}
          currentListContext={currentList}
          isLoadingData={isLoadingUsers}
          subscriptions={subscriptions}
          subscribers={subscribers}
          customListUsers={customListUsers}
        />
      </div>
    </div>
  );
}
