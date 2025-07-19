"use client";

import PostsClientInfiniteScrollWithSelection from "@/components/Post/Posts/PostsClientInfiniteScrollWithSelection";
import TagSearchFilter from "@/components/Post/Posts/Custom/TagSearch/TagSearchFilter";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import MediaTypeFetchedSwitch from "@/components/Post/Posts/Custom/MoreThanFriend/MediaTypeFetchedSwitch";
import useWindowWidth from "@/hooks/useWindowWidth";

export default function ContentDepotMediaDisplay({
  mongoUser,
  searchParamsObject,
  isOwner = true,
  posts,
  currentListContext = null, // New prop for current list context
  isLoadingCustomList = false,
  currentListId,
}) {
  const [refreshKey, setRefreshKey] = useState(0);
  const searchParams = useSearchParams();
  const { isMobileSm } = useWindowWidth();

  // Apply mediaType filtering to the searchParamsObject for system lists
  const finalSearchParamsObject = useMemo(() => {
    const mediaType = searchParams.get("mediaType");

    if (!searchParamsObject) {
      return null;
    }

    let result = { ...searchParamsObject };

    // Apply mediaType filters similar to UserFullPostUserMedia.js
    if (mediaType === "video") {
      result = {
        ...result,
        fileType: "video",
      };
    } else if (mediaType === "photo") {
      result = {
        ...result,
        fileType: "image",
        fileUrl_not_contains: ".gif", // Exclude GIFs from photos
      };
    } else if (mediaType === "gif") {
      result = {
        ...result,
        fileType: "image", // GIFs are stored as image type
        fileUrl_contains: ".gif", // Filter for GIFs only
      };
    }
    // For "all" or no mediaType, no additional filtering

    console.log("ContentDepotMediaDisplay - mediaType:", mediaType);
    console.log("ContentDepotMediaDisplay - finalSearchParamsObject:", result);

    return result;
  }, [searchParamsObject, searchParams.get("mediaType")]);

  // Apply mediaType filtering to pre-fetched posts for custom lists
  const filteredCustomPosts = useMemo(() => {
    if (!posts || !Array.isArray(posts)) {
      return null;
    }

    const mediaType = searchParams.get("mediaType");

    if (!mediaType || mediaType === "all") {
      return posts;
    }

    return posts.filter((post) => {
      if (mediaType === "video") {
        return post.fileType === "video";
      } else if (mediaType === "photo") {
        return post.fileType === "image" && !post.fileUrl?.includes(".gif");
      } else if (mediaType === "gif") {
        return post.fileType === "image" && post.fileUrl?.includes(".gif");
      }
      return true;
    });
  }, [posts, searchParams.get("mediaType")]);

  // Determine which approach to use based on what data we have
  const isCustomListMode = posts !== null;
  const effectivePosts = isCustomListMode ? filteredCustomPosts : null;
  const effectiveSearchParams = isCustomListMode
    ? null
    : finalSearchParamsObject;

  // Force refresh when search params change
  useEffect(() => {
    setRefreshKey((prev) => prev + 1);
  }, [
    finalSearchParamsObject,
    filteredCustomPosts,
    searchParams.get("mediaType"),
  ]);

  const col = {
    name: "attachments",
    // Used NOT in posts route so need manual settings
    settings: { noFullPost: true, noOtherIcons: true },
  };

  // Don't render main content if we're loading custom list attachments
  if (isLoadingCustomList) {
    return null;
  }

  // ! don't show ContentDepotMediaDisplay on mobile if not on userlistshub
  if (currentListId === "userlistshub" && isMobileSm) return null;

  return (
    <div className="">
      {/* Tag Search Filter */}
      <TagSearchFilter visitedUserId={mongoUser?._id} isOwner={isOwner} />
      <MediaTypeFetchedSwitch
        mongoUser={mongoUser}
        visitedUserId={mongoUser?._id}
        isOwner={isOwner}
        currentListContext={currentListContext}
        preloadedPosts={isCustomListMode ? posts : null}
      />

      <PostsClientInfiniteScrollWithSelection
        key={refreshKey} // Force re-render when search params change
        {...{
          posts: effectivePosts,
          data: effectiveSearchParams, // Pass the filtered search params with mediaType
          col,
          isAdmin: mongoUser?.isAdmin || false,
          mongoUser,
          className: "w-full",
        }}
      />
    </div>
  );
}
