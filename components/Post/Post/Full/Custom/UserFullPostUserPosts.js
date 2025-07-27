"use client";

import PostsClientInfiniteScroll from "@/components/Post/Posts/PostsClientInfiniteScroll";
import PostsFetchedTypeSwitch from "@/components/Post/Posts/Custom/MoreThanFriend/PostsFetchedTypeSwitch";
import UserFullPostUserPostLabelPosts from "./UserFullPostUserPostLabelPosts";
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
    const baseParams = {
      // ! don't use active here, coz we need to show "all" posts
      type: searchParams.get("type"),
    };

    // Add createdBy filter only if visitedMongoUser exists
    if (visitedMongoUser?._id) {
      baseParams.createdBy = visitedMongoUser._id;
    }

    // Add post label filtering if specified
    const postLabelParam = searchParams.get("postLabel");
    if (postLabelParam && postLabelParam !== "all") {
      baseParams.postLabel = postLabelParam;
    }

    return baseParams;
  }, [searchParams, visitedMongoUser]);

  const col = {
    name: "feeds",
    // ! used NOT is posts route so need manual settings
    settings: { hasLikes: true, hasComments: true, noFullPost: true },
  };

  const isOwner =
    mongoUser?._id &&
    visitedMongoUser?._id &&
    mongoUser._id === visitedMongoUser._id;

  return (
    <div>
      {/* // ! don't delete/modify/uncomment this! */}
      {/* {isOwner && <PostsFetchedTypeSwitch {...{ mongoUser }} />} */}

      {/* Show post label posts switch for the visited user */}
      <UserFullPostUserPostLabelPosts
        {...{
          mongoUser,
          visitedMongoUser,
        }}
      />

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
