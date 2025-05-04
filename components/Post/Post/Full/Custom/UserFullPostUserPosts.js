"use client";

import PostsClientInfiniteScroll from "@/components/Post/Posts/PostsClientInfiniteScroll";
import PostsFetchedTypeSwitch from "@/components/Post/Posts/Custom/MoreThanFriend/PostsFetchedTypeSwitch";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

// TODO !!! BUG: FeedPost has no likes
export default function UserFullPostUserPosts({
  post,
  isAdmin,
  mongoUser,
  visitedMongoUser,
}) {
  const searchParams = useSearchParams();

  // ! Base search params with active state from URL
  const searchParamsObject = useMemo(() => {
    return {
      // ! don't use active here, coz we need to show "all" posts
      type: searchParams.get("type"),
      createdBy: visitedMongoUser?._id || "noUserId",
    };
  }, [searchParams, visitedMongoUser]);

  const col = {
    name: "feeds",
    // ! used NOT is posts route so need manual settings
    settings: { hasLikes: true, hasComments: true, noFullPost: true },
  };

  const isOwner = mongoUser?._id && post?._id === mongoUser?._id;

  return (
    <div>
      {isOwner && <PostsFetchedTypeSwitch {...{ mongoUser }} />}
      <PostsClientInfiniteScroll
        {...{
          isOwner,
          searchParams: searchParamsObject,
          col,
          isAdmin,
          //   limit,
          mongoUser,
          //   className,
        }}
      />
    </div>
  );
}
