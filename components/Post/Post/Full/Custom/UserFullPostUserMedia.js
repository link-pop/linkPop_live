"use client";

import PostsClientInfiniteScroll from "@/components/Post/Posts/PostsClientInfiniteScroll";
import MediaTypeFetchedSwitch from "@/components/Post/Posts/Custom/MoreThanFriend/MediaTypeFetchedSwitch";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export default function UserFullPostUserMedia({
  post,
  isAdmin,
  mongoUser,
  visitedMongoUser,
}) {
  const searchParams = useSearchParams();
  const isOwner = mongoUser?._id && post?._id === mongoUser?._id;

  // Base search params with media type from URL
  const searchParamsObject = useMemo(() => {
    const mediaType = searchParams.get("mediaType");

    // Handle special case for video type (for both owner and visitor)
    if (mediaType === "video") {
      return {
        createdBy: visitedMongoUser?._id || "noUserId",
        fileType: "video",
        ...(isOwner ? {} : { uploadedFrom: "feeds" }), // For visitors, only show videos from feeds
      };
    }

    // Handle special case for photo type (for both owner and visitor)
    if (mediaType === "photo") {
      return {
        createdBy: visitedMongoUser?._id || "noUserId",
        fileType: "image",
        ...(isOwner ? {} : { uploadedFrom: "feeds" }), // For visitors, only show photos from feeds
      };
    }

    // For owner, handle other media types
    if (isOwner) {
      return {
        createdBy: visitedMongoUser?._id || "noUserId",
        ...(mediaType && mediaType !== "all"
          ? { uploadedFrom: mediaType }
          : {}),
      };
    }

    // For non-owner (visitor), default to showing feeds content only
    return {
      createdBy: visitedMongoUser?._id || "noUserId",
      uploadedFrom: "feeds",
    };
  }, [searchParams, visitedMongoUser, isOwner, mongoUser, post]);

  const col = {
    name: "attachments",
    // Used NOT in posts route so need manual settings
    settings: { noFullPost: true, noOtherIcons: true },
  };

  return (
    <div>
      <MediaTypeFetchedSwitch
        {...{
          mongoUser,
          visitedUserId: visitedMongoUser?._id,
          isOwner, // Pass isOwner flag to allow filtering visible types
        }}
      />
      <PostsClientInfiniteScroll
        {...{
          searchParams: searchParamsObject,
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
