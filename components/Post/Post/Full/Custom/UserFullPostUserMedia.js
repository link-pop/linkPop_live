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
    // If not owner, only show feeds media regardless of URL params
    if (!isOwner) {
      return {
        createdBy: visitedMongoUser?._id || "noUserId",
        uploadedFrom: "feeds"
      };
    }
    
    // For owner, respect the mediaType from URL
    return {
      mediaType: searchParams.get("mediaType"),
      createdBy: visitedMongoUser?._id || "noUserId",
      ...(searchParams.get("mediaType") &&
      searchParams.get("mediaType") !== "all"
        ? { uploadedFrom: searchParams.get("mediaType") }
        : {}),
    };
  }, [searchParams, visitedMongoUser, isOwner, mongoUser, post]);

  const col = {
    name: "attachments",
    // Used NOT in posts route so need manual settings
    settings: { noFullPost: true, noOtherIcons: true },
  };

  return (
    <div>
      {isOwner && (
        <MediaTypeFetchedSwitch
          {...{
            mongoUser,
            visitedUserId: visitedMongoUser?._id,
          }}
        />
      )}
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
