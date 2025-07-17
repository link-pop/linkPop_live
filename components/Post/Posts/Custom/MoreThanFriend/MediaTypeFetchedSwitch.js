"use client";

import { getAll } from "@/lib/actions/crud";
import { getChatAttachments } from "@/lib/actions/getChatAttachments";
import FetchedTypeSwitch from "./FetchedTypeSwitch";

export default function MediaTypeFetchedSwitch({
  mongoUser,
  visitedUserId,
  isOwner = false,
  isChatGallery = false,
  chatId = null,
}) {
  // Define media types for the switch based on the AttachmentModel enum values
  const allMediaTypes = [
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
    {
      value: "video",
      label: "video",
      query: {
        createdBy: visitedUserId || mongoUser?._id,
        fileType: "video",
      },
    },
    {
      value: "photo",
      label: "photo",
      query: {
        createdBy: visitedUserId || mongoUser?._id,
        fileType: "image",
        // Exclude GIFs from photos
        fileUrl_not_contains: ".gif",
      },
    },
    {
      value: "gif",
      label: "gif",
      query: {
        createdBy: visitedUserId || mongoUser?._id,
        fileType: "image", // GIFs are stored as image type
        fileUrl_contains: ".gif", // We'll use this to filter in the server function
      },
    },
  ];

  // Filter media types based on ownership and chat gallery context
  let mediaTypes;

  if (isChatGallery && chatId) {
    // For chat gallery, only show photo, video, gif, and all
    // Hide feeds, chatmessages, welcomeMessage types
    mediaTypes = [
      {
        value: "all",
        label: "all",
        query: {
          uploadedFrom: "chatmessages",
          chatId: chatId,
        },
      },
      {
        value: "photo",
        label: "photo",
        query: {
          uploadedFrom: "chatmessages",
          chatId: chatId,
          fileType: "image",
          fileUrl_not_contains: ".gif",
        },
      },
      {
        value: "video",
        label: "video",
        query: {
          uploadedFrom: "chatmessages",
          chatId: chatId,
          fileType: "video",
        },
      },
      {
        value: "gif",
        label: "gif",
        query: {
          uploadedFrom: "chatmessages",
          chatId: chatId,
          fileType: "image",
          fileUrl_contains: ".gif",
        },
      },
    ];
  } else {
    // Original logic for non-chat gallery
    // Visitors (non-owners) only see photo, video, and gif options
    mediaTypes = isOwner
      ? allMediaTypes
      : [
          {
            value: "all",
            label: "all",
            query: {
              createdBy: visitedUserId || mongoUser?._id,
              uploadedFrom: "feeds", // Restrict to feeds for visitors
            },
          },
          {
            value: "photo",
            label: "photo",
            query: {
              createdBy: visitedUserId || mongoUser?._id,
              fileType: "image",
              fileUrl_not_contains: ".gif", // Exclude GIFs from photos
              uploadedFrom: "feeds", // Restrict to feeds for visitors
            },
          },
          {
            value: "video",
            label: "video",
            query: {
              createdBy: visitedUserId || mongoUser?._id,
              fileType: "video",
              uploadedFrom: "feeds", // Restrict to feeds for visitors
            },
          },
          {
            value: "gif",
            label: "gif",
            query: {
              createdBy: visitedUserId || mongoUser?._id,
              fileType: "image", // GIFs are stored as image type
              fileUrl_contains: ".gif", // We'll use this to filter in the server function
              uploadedFrom: "feeds", // Restrict to feeds for visitors
            },
          },
        ];
  }

  // Custom query function for media types
  const mediaQueryFn = async () => {
    if (!isChatGallery && !mongoUser?._id && !visitedUserId) {
      return mediaTypes.reduce((acc, type) => {
        acc[type.value] = 0;
        return acc;
      }, {});
    }

    if (isChatGallery && !chatId) {
      return mediaTypes.reduce((acc, type) => {
        acc[type.value] = 0;
        return acc;
      }, {});
    }

    try {
      // Get counts for each media type
      const typeCounts = await Promise.all(
        mediaTypes.map((type) => {
          if (isChatGallery && chatId) {
            // Use special chat attachments function for chat gallery
            let filters = {};

            if (type.value === "gif") {
              filters = { fileType: "image", fileUrl_contains: ".gif" };
            } else if (type.value === "photo") {
              filters = { fileType: "image", fileUrl_not_contains: ".gif" };
            } else if (type.value === "video") {
              filters = { fileType: "video" };
            }
            // For "all" type, no additional filters

            return getChatAttachments(chatId, filters, mongoUser);
          } else {
            // Original logic for non-chat gallery
            // Special handling for GIF type
            if (type.value === "gif") {
              // We need to directly search for GIFs by fileUrl extension since our custom
              // fileUrl_contains parameter doesn't work with the count functions correctly
              const baseData = {
                createdBy: visitedUserId || mongoUser?._id,
                ...(isOwner ? {} : { uploadedFrom: "feeds" }),
              };

              return getAll({
                col: "attachments",
                data: baseData,
                searchParams: { fileUrl_contains: ".gif" },
              });
            }

            // Special handling for photo type to exclude GIFs
            if (type.value === "photo") {
              const baseData = {
                createdBy: visitedUserId || mongoUser?._id,
                fileType: "image",
                ...(isOwner ? {} : { uploadedFrom: "feeds" }),
              };

              return getAll({
                col: "attachments",
                data: baseData,
                searchParams: { fileUrl_not_contains: ".gif" },
              });
            }

            // Normal query for other types
            return getAll({
              col: "attachments",
              data: type.query,
            });
          }
        })
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
