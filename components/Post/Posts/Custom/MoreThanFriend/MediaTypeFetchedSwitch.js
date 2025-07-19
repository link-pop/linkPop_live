"use client";

import { getAll } from "@/lib/actions/crud";
import { getChatAttachments } from "@/lib/actions/getChatAttachments";
import FetchedTypeSwitch from "./FetchedTypeSwitch";
import mongoose from "mongoose";

export default function MediaTypeFetchedSwitch({
  mongoUser,
  visitedUserId,
  isOwner = false,
  isChatGallery = false,
  chatId = null,
  currentListContext = null, // New prop for current list context
  preloadedPosts = null, // New prop for pre-fetched posts (custom lists)
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
    // Handle preloaded posts (custom lists) - count from JavaScript arrays
    if (preloadedPosts && Array.isArray(preloadedPosts)) {
      console.log(
        "🔍 MediaTypeFetchedSwitch - Using preloaded posts for counting"
      );

      return mediaTypes.reduce((acc, type) => {
        if (type.value === "all") {
          acc[type.value] = preloadedPosts.length;
        } else if (type.value === "video") {
          acc[type.value] = preloadedPosts.filter(
            (post) => post.fileType === "video"
          ).length;
        } else if (type.value === "photo") {
          acc[type.value] = preloadedPosts.filter(
            (post) =>
              post.fileType === "image" && !post.fileUrl?.includes(".gif")
          ).length;
        } else if (type.value === "gif") {
          acc[type.value] = preloadedPosts.filter(
            (post) =>
              post.fileType === "image" && post.fileUrl?.includes(".gif")
          ).length;
        } else {
          acc[type.value] = 0;
        }
        return acc;
      }, {});
    }

    // Handle database queries (system lists and chat galleries)
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
            // Handle custom lists by applying attachmentIds filtering
            if (
              currentListContext &&
              currentListContext.isCustom &&
              currentListContext.attachmentIds
            ) {
              // For custom lists, we need to filter by specific attachment IDs
              let baseQuery = {
                createdBy: visitedUserId || mongoUser?._id,
              };

              // Apply attachmentIds filter
              if (currentListContext.attachmentIds.length > 0) {
                const objectIds = currentListContext.attachmentIds
                  .filter(
                    (id) =>
                      id && typeof id === "string" && /^[a-f\d]{24}$/i.test(id)
                  )
                  .map((id) => new mongoose.Types.ObjectId(id));
                baseQuery._id = { $in: objectIds };
              } else {
                // If no attachment IDs, return empty result
                baseQuery._id = { $in: [] };
              }

              // Apply media type filters
              if (type.value === "gif") {
                baseQuery.fileType = "image";
                return getAll({
                  col: "attachments",
                  data: baseQuery,
                  searchParams: { fileUrl_contains: ".gif" },
                });
              } else if (type.value === "photo") {
                baseQuery.fileType = "image";
                return getAll({
                  col: "attachments",
                  data: baseQuery,
                  searchParams: { fileUrl_not_contains: ".gif" },
                });
              } else if (type.value === "video") {
                baseQuery.fileType = "video";
                return getAll({
                  col: "attachments",
                  data: baseQuery,
                });
              } else {
                // For "all" type, no additional fileType filter
                return getAll({
                  col: "attachments",
                  data: baseQuery,
                });
              }
            } else {
              // Original logic for system lists
              // Special handling for GIF type
              if (type.value === "gif") {
                // We need to directly search for GIFs by fileUrl extension since our custom
                // fileUrl_contains parameter doesn't work with the count functions correctly
                const baseData = {
                  createdBy: visitedUserId || mongoUser?._id,
                  ...(isOwner ? {} : { uploadedFrom: "feeds" }),
                  // Apply current list context for system lists
                  ...(currentListContext && !currentListContext.isCustom
                    ? {
                        ...(currentListContext.uploadedFrom
                          ? { uploadedFrom: currentListContext.uploadedFrom }
                          : {}),
                        ...(currentListContext.fileType
                          ? { fileType: currentListContext.fileType }
                          : {}),
                      }
                    : {}),
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
                  // Apply current list context for system lists
                  ...(currentListContext && !currentListContext.isCustom
                    ? {
                        ...(currentListContext.uploadedFrom
                          ? { uploadedFrom: currentListContext.uploadedFrom }
                          : {}),
                      }
                    : {}),
                };

                return getAll({
                  col: "attachments",
                  data: baseData,
                  searchParams: { fileUrl_not_contains: ".gif" },
                });
              }

              // Normal query for other types
              let queryData = { ...type.query };

              // Apply current list context for system lists
              if (currentListContext && !currentListContext.isCustom) {
                if (currentListContext.uploadedFrom) {
                  queryData.uploadedFrom = currentListContext.uploadedFrom;
                }
                if (currentListContext.fileType) {
                  queryData.fileType = currentListContext.fileType;
                }
              }

              return getAll({
                col: "attachments",
                data: queryData,
              });
            }
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
      console.error("❌ Error fetching media counts:", error);
      return mediaTypes.reduce((acc, type) => {
        acc[type.value] = 0;
        return acc;
      }, {});
    }
  };

  // Create a unique query key that includes the current list context and preloaded posts
  const queryKey = [
    "attachments",
    "mediaStats",
    mongoUser?._id || visitedUserId,
    currentListContext?.id || "default",
    isChatGallery ? chatId : null,
    // Add preloadedPosts info to key so it updates when posts change
    preloadedPosts ? `preloaded-${preloadedPosts.length}` : "db-query",
    // Add a hash of the preloaded posts to detect content changes
    preloadedPosts
      ? JSON.stringify(preloadedPosts.map((p) => p._id)).slice(0, 20)
      : null,
  ].filter(Boolean);

  return (
    <FetchedTypeSwitch
      mongoUser={mongoUser}
      types={mediaTypes}
      collection="attachments"
      queryKey={queryKey}
      queryFn={mediaQueryFn}
      paramName="mediaType"
      defaultType="all"
    />
  );
}
