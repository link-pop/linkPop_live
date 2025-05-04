"use client";

import { getAll } from "@/lib/actions/crud";
import FetchedTypeSwitch from "./FetchedTypeSwitch";

export default function MediaTypeFetchedSwitch({ mongoUser, visitedUserId }) {
  // Define media types for the switch based on the AttachmentModel enum values
  const mediaTypes = [
    {
      value: "all",
      label: "all",
      query: {
        createdBy: visitedUserId || mongoUser?._id,
      },
    },
    {
      value: "feeds",
      label: "posts",
      query: {
        createdBy: visitedUserId || mongoUser?._id,
        uploadedFrom: "feeds",
      },
    },
    {
      value: "chatmessages",
      label: "messages",
      query: {
        createdBy: visitedUserId || mongoUser?._id,
        uploadedFrom: "chatmessages",
      },
    },
    {
      value: "welcomeMessage",
      label: "welcome",
      query: {
        createdBy: visitedUserId || mongoUser?._id,
        uploadedFrom: "welcomeMessage",
      },
    },
  ];

  // Custom query function for media types
  const mediaQueryFn = async () => {
    if (!mongoUser?._id && !visitedUserId) {
      return mediaTypes.reduce((acc, type) => {
        acc[type.value] = 0;
        return acc;
      }, {});
    }

    try {
      // Get counts for each media type
      const typeCounts = await Promise.all(
        mediaTypes.map(type => 
          getAll({
            col: "attachments",
            data: type.query,
          })
        )
      );

      // Create counts object
      const counts = mediaTypes.reduce((acc, type, index) => {
        acc[type.value] = typeCounts[index]?.length || 0;
        return acc;
      }, {});

      return counts;
    } catch (error) {
      console.error("Error fetching media counts:", error);
      return mediaTypes.reduce((acc, type) => {
        acc[type.value] = 0;
        return acc;
      }, {});
    }
  };

  return (
    <FetchedTypeSwitch
      mongoUser={mongoUser}
      types={mediaTypes}
      collection="attachments"
      queryKey={["attachments", "mediaStats"]}
      queryFn={mediaQueryFn}
      paramName="mediaType"
      defaultType="all"
    />
  );
}
