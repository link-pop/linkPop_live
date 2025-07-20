"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import useWindowWidth from "@/hooks/useWindowWidth";
import PostsLoader from "@/components/Post/Posts/PostsLoader";
import UsersWithSelection from "@/components/ui/shared/UserCard/UsersWithSelection";
import NoPosts from "@/components/Post/Posts/NoPosts";
import SubscriptionTypeSwitch from "@/components/ui/shared/SubscriptionTypeSwitch/SubscriptionTypeSwitch";

export default function UserListsDisplay({
  mongoUser,
  currentListId,
  currentListContext = null,
  isLoadingData = false,
  subscriptions = [],
  subscribers = [],
  customListUsers = [],
}) {
  const [refreshKey, setRefreshKey] = useState(0);
  const searchParams = useSearchParams();
  const { isMobileSm } = useWindowWidth();

  // Get subscription type filter from URL params
  const subscriptionType = searchParams.get("subscriptionType") || "all";

  // Determine which data to show based on current list
  const displayData = useMemo(() => {
    if (currentListContext?.isCustom) {
      return customListUsers;
    }

    switch (currentListId) {
      case "subscriptions":
        // Filter subscriptions based on type
        if (subscriptionType === "all") {
          return subscriptions;
        }

        const now = new Date();
        return subscriptions.filter((sub) => {
          if (subscriptionType === "active") {
            // Active: not expired or no expiration date
            if (!sub.expiresAt) return true;
            return new Date(sub.expiresAt) > now;
          } else if (subscriptionType === "expired") {
            // Expired: has expiration date and is expired
            if (!sub.expiresAt) return false;
            return new Date(sub.expiresAt) <= now;
          }
          return true;
        });
      case "subscribers":
        return subscribers;
      default:
        return [];
    }
  }, [
    currentListId,
    currentListContext,
    subscriptions,
    subscribers,
    customListUsers,
    subscriptionType,
  ]);

  // Process users data for selection system
  const processedUsers = useMemo(() => {
    return displayData.map((userData, index) => {
      // Handle different data structures
      let user = userData;
      let additionalInfo = {};

      // For subscriptions: user data is in subscribedTo field (already populated)
      if (currentListId === "subscriptions" && userData.subscribedTo) {
        user = userData.subscribedTo;
        console.log("🔍 Subscription user data:", user);
        additionalInfo = {
          subscribedAt: userData.createdAt,
          isPaid: userData.isPaid,
          price: userData.price,
          expiresAt: userData.expiresAt,
        };
      }

      // For subscribers: user data is in createdBy field (already populated)
      if (currentListId === "subscribers" && userData.createdBy) {
        user = userData.createdBy;
        console.log("🔍 Subscriber user data:", user);
        additionalInfo = {
          subscribedAt: userData.createdAt,
          isPaid: userData.isPaid,
          price: userData.price,
          expiresAt: userData.expiresAt,
        };
      }

      // Return user object with additionalInfo as a separate property
      // This maintains the original user structure for selection while providing additionalInfo for display
      return {
        ...user,
        _additionalInfo: additionalInfo, // Use _additionalInfo to avoid conflicts
      };
    });
  }, [displayData, currentListId]);

  // Force refresh when search params change
  useEffect(() => {
    setRefreshKey((prev) => prev + 1);
  }, [currentListId, displayData]);

  // Don't render main content if we're loading
  if (isLoadingData) {
    return <PostsLoader isLoading={true} />;
  }

  // Don't show UserListsDisplay on mobile if not on userlistshub
  if (currentListId === "userlistshub" && isMobileSm) return null;

  // Show empty state if no data
  if (!processedUsers || processedUsers.length === 0) {
    return <NoPosts />;
  }

  const handleUserClick = (user) => {
    console.log("User clicked:", user);
  };

  return (
    <div className="UserListsDisplay">
      {/* Show subscription type switch only for subscriptions list */}
      {currentListId === "subscriptions" && (
        <SubscriptionTypeSwitch mongoUser={mongoUser} className="mb-4" />
      )}

      <UsersWithSelection
        users={processedUsers}
        mongoUser={mongoUser}
        showActions={true}
        showSubscriptionStatus={true}
        enableSelection={true}
        onUserClick={handleUserClick}
        noUsersMessage="No users found"
      />
    </div>
  );
}
