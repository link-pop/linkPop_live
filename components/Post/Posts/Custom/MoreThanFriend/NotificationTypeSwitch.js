"use client";

import { getAll } from "@/lib/actions/crud";
import FetchedTypeSwitch from "./FetchedTypeSwitch";

export default function NotificationTypeSwitch({ mongoUser }) {
  // Define notification types for the switch
  const notificationTypes = [
    {
      value: "all",
      label: "all",
      query: {
        userId: mongoUser?._id,
      },
    },
    {
      value: "like",
      label: "likes",
      query: {
        userId: mongoUser?._id,
        type: "like",
      },
    },
    {
      value: "unlike",
      label: "unlikes",
      query: {
        userId: mongoUser?._id,
        type: "unlike",
      },
    },
    {
      value: "comment",
      label: "comments",
      query: {
        userId: mongoUser?._id,
        type: "comment",
      },
    },
    {
      value: "follow",
      label: "follows",
      query: {
        userId: mongoUser?._id,
        type: "follow",
      },
    },
    {
      value: "unfollow",
      label: "unfollows",
      query: {
        userId: mongoUser?._id,
        type: "unfollow",
      },
    },
    {
      value: "mention",
      label: "mentions",
      query: {
        userId: mongoUser?._id,
        type: "mention",
      },
    },
    {
      value: "auction",
      label: "auctions",
      query: {
        userId: mongoUser?._id,
        type: {
          $in: [
            "auction_won",
            "auction_sold",
            "auction_ended",
            "auction_outbid",
          ],
        },
      },
    },
    {
      value: "system",
      label: "system",
      query: {
        userId: mongoUser?._id,
        type: "system",
      },
    },
    {
      value: "message_purchase",
      label: "purchases",
      query: {
        userId: mongoUser?._id,
        type: "message_purchase",
      },
    },
  ];

  // Custom query function for notifications
  const notificationQueryFn = async () => {
    if (!mongoUser?._id) {
      return notificationTypes.reduce((acc, type) => {
        acc[type.value] = 0;
        return acc;
      }, {});
    }

    try {
      // Get all notifications for this user
      const allNotifications = await getAll({
        col: "notifications",
        data: {
          userId: mongoUser._id,
        },
      });

      // Count notifications by type
      const counts = {
        all: allNotifications?.length || 0,
      };

      // Count specific notification types
      notificationTypes.slice(1).forEach((type) => {
        if (type.value === "auction") {
          // Count all auction-related notifications
          counts[type.value] =
            allNotifications?.filter((notification) =>
              [
                "auction_won",
                "auction_sold",
                "auction_ended",
                "auction_outbid",
              ].includes(notification.type)
            ).length || 0;
        } else {
          counts[type.value] =
            allNotifications?.filter(
              (notification) => notification.type === type.value
            ).length || 0;
        }
      });

      return counts;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return notificationTypes.reduce((acc, type) => {
        acc[type.value] = 0;
        return acc;
      }, {});
    }
  };

  return (
    <FetchedTypeSwitch
      mongoUser={mongoUser}
      types={notificationTypes}
      collection="notifications"
      queryKey={["notifications", "userStats"]}
      queryFn={notificationQueryFn}
      paramName="notificationType"
      defaultType="all"
    />
  );
}
