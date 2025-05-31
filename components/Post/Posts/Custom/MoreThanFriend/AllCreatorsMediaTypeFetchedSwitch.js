"use client";

import { getAll } from "@/lib/actions/crud";
import FetchedTypeSwitch from "./FetchedTypeSwitch";

export default function AllCreatorsMediaTypeFetchedSwitch({ mongoUser }) {
  // Define media types for the switch - for all creators (only public content)
  const mediaTypes = [
    {
      value: "all",
      label: "all",
      query: {
        uploadedFrom: "feeds", // Only show public content from feeds
      },
    },
    {
      value: "photo",
      label: "photo",
      query: {
        fileType: "image",
        fileUrl_not_contains: ".gif", // Exclude GIFs from photos
        uploadedFrom: "feeds", // Only show public content from feeds
      },
    },
    {
      value: "video",
      label: "video",
      query: {
        fileType: "video",
        uploadedFrom: "feeds", // Only show public content from feeds
      },
    },
    {
      value: "gif",
      label: "gif",
      query: {
        fileType: "image", // GIFs are stored as image type
        fileUrl_contains: ".gif", // We'll use this to filter in the server function
        uploadedFrom: "feeds", // Only show public content from feeds
      },
    },
  ];

  // Custom query function for media types - for all creators
  const mediaQueryFn = async () => {
    try {
      // Get counts for each media type
      const typeCounts = await Promise.all(
        mediaTypes.map((type) => {
          // Special handling for GIF type
          if (type.value === "gif") {
            // We need to directly search for GIFs by fileUrl extension since our custom
            // fileUrl_contains parameter doesn't work with the count functions correctly
            return getAll({
              col: "attachments",
              data: {
                uploadedFrom: "feeds", // Only public content
              },
              searchParams: { fileUrl_contains: ".gif" },
            });
          }

          // Special handling for photo type to exclude GIFs
          if (type.value === "photo") {
            return getAll({
              col: "attachments",
              data: {
                fileType: "image",
                uploadedFrom: "feeds", // Only public content
              },
              searchParams: { fileUrl_not_contains: ".gif" },
            });
          }

          // Normal query for other types
          return getAll({
            col: "attachments",
            data: type.query,
          });
        })
      );

      // Create counts object
      const counts = mediaTypes.reduce((acc, type, index) => {
        acc[type.value] = typeCounts[index]?.length || 0;
        return acc;
      }, {});

      return counts;
    } catch (error) {
      console.error("Error fetching all creators media counts:", error);
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
      queryKey={["attachments", "allCreatorsMediaStats"]}
      queryFn={mediaQueryFn}
      paramName="mediaType"
      defaultType="all"
    />
  );
}
