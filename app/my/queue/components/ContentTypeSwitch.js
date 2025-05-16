"use client";

import { getAll } from "@/lib/actions/crud";
import FetchedTypeSwitch from "@/components/Post/Posts/Custom/MoreThanFriend/FetchedTypeSwitch";

export default function ContentTypeSwitch({ mongoUser }) {
  // Define content types for the switch
  const contentTypes = [
    {
      value: "posts",
      label: "Posts",
      query: {
        createdBy: mongoUser?._id,
        scheduleAt: { $exists: true, $ne: null, $gt: new Date() },
      },
    },
    {
      value: "messages",
      label: "Messages",
      query: {
        createdBy: mongoUser?._id,
        scheduleAt: { $exists: true, $ne: null, $gt: new Date() },
      },
    },
  ];

  // Custom query function to count both posts and messages
  const countQueryFn = async () => {
    if (!mongoUser?._id) {
      return contentTypes.reduce((acc, type) => {
        acc[type.value] = 0;
        return acc;
      }, {});
    }

    try {
      // Query for posts count
      const postsCount = await getAll({
        col: "feeds",
        data: {
          createdBy: mongoUser._id,
          scheduleAt: { $exists: true, $ne: null, $gt: new Date() },
        },
      });

      // Query for messages count
      const messagesCount = await getAll({
        col: "chatmessages",
        data: {
          createdBy: mongoUser._id,
          scheduleAt: { $exists: true, $ne: null, $gt: new Date() },
        },
      });

      return {
        posts: postsCount?.length || 0,
        messages: messagesCount?.length || 0,
      };
    } catch (error) {
      console.error("Error fetching counts:", error);
      return {
        posts: 0,
        messages: 0,
      };
    }
  };

  return (
    <FetchedTypeSwitch
      mongoUser={mongoUser}
      types={contentTypes}
      queryKey={["queue", "contentTypes"]}
      queryFn={countQueryFn}
      paramName="contentType"
      defaultType="posts"
    />
  );
}
