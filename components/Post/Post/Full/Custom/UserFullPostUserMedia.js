"use client";

import PostsClientInfiniteScroll from "@/components/Post/Posts/PostsClientInfiniteScroll";
import MediaTypeFetchedSwitch from "@/components/Post/Posts/Custom/MoreThanFriend/MediaTypeFetchedSwitch";
import TagSearchFilter from "@/components/Post/Posts/Custom/TagSearch/TagSearchFilter";
import { useSearchParams } from "next/navigation";
import { useMemo, useState, useEffect } from "react";

export default function UserFullPostUserMedia({
  post,
  isAdmin,
  mongoUser,
  visitedMongoUser,
  isOwner: isOwnerProp,
  isChatGallery = false,
  chatId = null,
}) {
  const searchParams = useSearchParams();
  const [refreshKey, setRefreshKey] = useState(0);

  // Use provided isOwner prop if available, otherwise calculate it
  const isOwner =
    isOwnerProp !== undefined
      ? isOwnerProp
      : mongoUser?._id && post?._id === mongoUser?._id;

  // Force refresh when search params change
  useEffect(() => {
    setRefreshKey((prev) => prev + 1);
  }, [searchParams]);

  // Base search params with media type from URL
  const searchParamsObject = useMemo(() => {
    const mediaType = searchParams.get("mediaType");
    const tagsParam = searchParams.get("tags");

    // Parse tags from URL
    const selectedTags = tagsParam
      ? tagsParam.split(",").filter((tag) => tag.trim())
      : [];

    console.log("UserFullPostUserMedia - mediaType:", mediaType);
    console.log("UserFullPostUserMedia - tagsParam:", tagsParam);
    console.log("UserFullPostUserMedia - selectedTags:", selectedTags);

    // Special handling for chat gallery
    if (isChatGallery && chatId) {
      // For chat gallery, we want to show files from all chatmessages in this specific chat
      // We'll use a special flag that will be handled by the data fetching functions
      const result = {
        isChatGallery: true,
        chatId: chatId, // Filter by specific chat ID
        ...(mediaType === "video" ? { fileType: "video" } : {}),
        ...(mediaType === "photo"
          ? { fileType: "image", fileUrl_not_contains: ".gif" }
          : {}),
        ...(mediaType === "gif"
          ? { fileType: "image", fileUrl_contains: ".gif" }
          : {}),
        ...(selectedTags.length > 0 ? { tags: selectedTags } : {}),
      };
      console.log(
        "UserFullPostUserMedia - Chat Gallery searchParamsObject:",
        result
      );
      return result;
    }

    // Handle special case for video type (for both owner and visitor)
    if (mediaType === "video") {
      const result = {
        createdBy: visitedMongoUser?._id || "noUserId",
        fileType: "video",
        ...(isOwner ? {} : { uploadedFrom: "feeds" }), // For visitors, only show videos from feeds
        ...(selectedTags.length > 0 ? { tags: selectedTags } : {}), // Add tag filtering
      };
      console.log("UserFullPostUserMedia - Video searchParamsObject:", result);
      return result;
    }

    // Handle special case for photo type (for both owner and visitor)
    // Exclude GIFs from photo results
    if (mediaType === "photo") {
      const result = {
        createdBy: visitedMongoUser?._id || "noUserId",
        fileType: "image",
        fileUrl_not_contains: ".gif", // Add a negative filter to exclude GIFs
        ...(isOwner ? {} : { uploadedFrom: "feeds" }), // For visitors, only show photos from feeds
        ...(selectedTags.length > 0 ? { tags: selectedTags } : {}), // Add tag filtering
      };
      console.log("UserFullPostUserMedia - Photo searchParamsObject:", result);
      return result;
    }

    // Handle special case for gif type (for both owner and visitor)
    if (mediaType === "gif") {
      const result = {
        createdBy: visitedMongoUser?._id || "noUserId",
        fileType: "image", // GIFs are stored as image type
        fileUrl_contains: ".gif", // We'll use this to filter in the server function
        ...(isOwner ? {} : { uploadedFrom: "feeds" }), // For visitors, only show gifs from feeds
        ...(selectedTags.length > 0 ? { tags: selectedTags } : {}), // Add tag filtering
      };
      console.log("UserFullPostUserMedia - GIF searchParamsObject:", result);
      return result;
    }

    // For owner, handle other media types
    if (isOwner) {
      const result = {
        createdBy: visitedMongoUser?._id || "noUserId",
        ...(mediaType && mediaType !== "all"
          ? { uploadedFrom: mediaType }
          : {}),
        ...(selectedTags.length > 0 ? { tags: selectedTags } : {}), // Add tag filtering
      };
      console.log("UserFullPostUserMedia - Owner searchParamsObject:", result);
      return result;
    }

    // For non-owner (visitor), default to showing feeds content only
    const result = {
      createdBy: visitedMongoUser?._id || "noUserId",
      uploadedFrom: "feeds",
      ...(selectedTags.length > 0 ? { tags: selectedTags } : {}), // Add tag filtering
    };

    console.log("UserFullPostUserMedia - Final searchParamsObject:", result);
    return result;
  }, [
    searchParams.toString(),
    visitedMongoUser,
    isOwner,
    mongoUser,
    post,
    isOwnerProp,
    isChatGallery,
    chatId,
  ]); // Use searchParams.toString() for better dependency tracking

  const col = {
    name: "attachments",
    // Used NOT in posts route so need manual settings
    settings: { noFullPost: true, noOtherIcons: true },
  };

  return (
    <div className="">
      <MediaTypeFetchedSwitch
        {...{
          mongoUser,
          visitedUserId: visitedMongoUser?._id,
          isOwner, // Pass isOwner flag to allow filtering visible types
          isChatGallery, // Pass chat gallery flag
          chatId, // Pass chat ID for filtering
        }}
      />

      {/* Tag Search Filter */}
      <TagSearchFilter
        visitedUserId={visitedMongoUser?._id}
        isOwner={isOwner}
      />

      <PostsClientInfiniteScroll
        key={refreshKey} // Force re-render when search params change
        {...{
          data: searchParamsObject, // Pass as data instead of searchParams
          col,
          isAdmin,
          //   limit,
          mongoUser,
          // TODO !! miw
          className: "miw600 f g0",
        }}
      />
    </div>
  );
}
