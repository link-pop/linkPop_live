"use client";

import { getAll } from "@/lib/actions/crud";
import FetchedTypeSwitch from "./FetchedTypeSwitch";
import useChatroomStatsUpdates from "@/hooks/useChatroomStatsUpdates";

export default function ChatroomsTypeSwitch({ mongoUser }) {
  // Use the hook to listen for chatroom stats updates
  useChatroomStatsUpdates(["chatrooms", "chatroomStats"], mongoUser?._id);

  // Define chatroom types for the switch
  const chatroomTypes = [
    {
      value: "all",
      label: "all",
      hideCount: true, // Don't show count for "all"
      query: {
        chatRoomUsers: mongoUser?._id,
      },
    },
    {
      value: "unread",
      label: "unread",
      query: {
        chatRoomUsers: mongoUser?._id,
        // This will be handled differently in the query function
        hasUnreadMessages: true,
      },
    },
  ];

  // Custom query function for chatroom types
  const chatroomQueryFn = async () => {
    if (!mongoUser?._id) {
      return chatroomTypes.reduce((acc, type) => {
        acc[type.value] = 0;
        return acc;
      }, {});
    }

    try {
      // Get all chatrooms for this user
      const allChatrooms = await getAll({
        col: "chatrooms",
        data: {
          chatRoomUsers: mongoUser._id,
        },
      });

      // Count chatrooms with unread messages
      let unreadCount = 0;

      console.log("🔍 Chatrooms debug:", {
        totalChatrooms: allChatrooms.length,
        userId: mongoUser._id.toString(),
        sampleChatroom: allChatrooms[0]
          ? {
              id: allChatrooms[0]._id,
              unreadCounts: allChatrooms[0].unreadCounts,
              unreadCountsType: typeof allChatrooms[0].unreadCounts,
            }
          : null,
      });

      for (const chatroom of allChatrooms) {
        // Check if this user has unread messages in this chatroom
        // Handle both Map (from MongoDB) and Object (from JSON serialization)
        let userUnreadCount = 0;

        if (chatroom.unreadCounts) {
          if (typeof chatroom.unreadCounts.get === "function") {
            // It's a Map instance
            userUnreadCount =
              chatroom.unreadCounts.get(mongoUser._id.toString()) || 0;
          } else if (typeof chatroom.unreadCounts === "object") {
            // It's a plain object (serialized Map)
            userUnreadCount =
              chatroom.unreadCounts[mongoUser._id.toString()] || 0;
          }
        }

        if (userUnreadCount > 0) {
          unreadCount++;
        }
      }

      return {
        all: allChatrooms?.length || 0,
        unread: unreadCount,
      };
    } catch (error) {
      console.error("Error fetching chatroom counts:", error);
      return chatroomTypes.reduce((acc, type) => {
        acc[type.value] = 0;
        return acc;
      }, {});
    }
  };

  return (
    <FetchedTypeSwitch
      className="wfc mra"
      mongoUser={mongoUser}
      types={chatroomTypes}
      collection="chatrooms"
      queryKey={["chatrooms", "chatroomStats"]}
      queryFn={chatroomQueryFn}
      paramName="chatroomType"
      defaultType="all"
    />
  );
}
