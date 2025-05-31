"use client";

import PostsClientInfiniteScroll from "@/components/Post/Posts/PostsClientInfiniteScroll";
import AllCreatorsMediaTypeFetchedSwitch from "@/components/Post/Posts/Custom/MoreThanFriend/AllCreatorsMediaTypeFetchedSwitch";
import AllCreatorsTagSearchFilter from "@/components/Post/Posts/Custom/TagSearch/AllCreatorsTagSearchFilter";
import { useSearchParams } from "next/navigation";
import { useMemo, useState, useEffect } from "react";

export default function AllCreatorsMedia({ isAdmin, mongoUser }) {
  const searchParams = useSearchParams();
  const [refreshKey, setRefreshKey] = useState(0);

  // Force refresh when search params change
  useEffect(() => {
    setRefreshKey((prev) => prev + 1);
  }, [searchParams]);

  // Base search params with media type from URL - for ALL creators
  const searchParamsObject = useMemo(() => {
    const mediaType = searchParams.get("mediaType");
    const tagsParam = searchParams.get("tags");

    // Parse tags from URL
    const selectedTags = tagsParam
      ? tagsParam.split(",").filter((tag) => tag.trim())
      : [];

    console.log("AllCreatorsMedia - mediaType:", mediaType);
    console.log("AllCreatorsMedia - tagsParam:", tagsParam);
    console.log("AllCreatorsMedia - selectedTags:", selectedTags);

    // Handle special case for video type - show all creators' videos from feeds
    if (mediaType === "video") {
      const result = {
        fileType: "video",
        uploadedFrom: "feeds", // Only show videos from feeds (public content)
        ...(selectedTags.length > 0 ? { tags: selectedTags } : {}), // Add tag filtering
      };
      console.log("AllCreatorsMedia - Video searchParamsObject:", result);
      return result;
    }

    // Handle special case for photo type - show all creators' photos from feeds
    // Exclude GIFs from photo results
    if (mediaType === "photo") {
      const result = {
        fileType: "image",
        fileUrl_not_contains: ".gif", // Add a negative filter to exclude GIFs
        uploadedFrom: "feeds", // Only show photos from feeds (public content)
        ...(selectedTags.length > 0 ? { tags: selectedTags } : {}), // Add tag filtering
      };
      console.log("AllCreatorsMedia - Photo searchParamsObject:", result);
      return result;
    }

    // Handle special case for gif type - show all creators' gifs from feeds
    if (mediaType === "gif") {
      const result = {
        fileType: "image", // GIFs are stored as image type
        fileUrl_contains: ".gif", // We'll use this to filter in the server function
        uploadedFrom: "feeds", // Only show gifs from feeds (public content)
        ...(selectedTags.length > 0 ? { tags: selectedTags } : {}), // Add tag filtering
      };
      console.log("AllCreatorsMedia - GIF searchParamsObject:", result);
      return result;
    }

    // Default case - show all media from feeds (public content only)
    const result = {
      uploadedFrom: "feeds", // Only show content from feeds (public content)
      ...(selectedTags.length > 0 ? { tags: selectedTags } : {}), // Add tag filtering
    };

    console.log("AllCreatorsMedia - Final searchParamsObject:", result);
    return result;
  }, [searchParams.toString()]); // Use searchParams.toString() for better dependency tracking

  const col = {
    name: "attachments",
    // Used NOT in posts route so need manual settings
    settings: { noFullPost: true, noOtherIcons: true },
  };

  return (
    <div className="bb">
      <AllCreatorsMediaTypeFetchedSwitch
        {...{
          mongoUser,
        }}
      />

      {/* Tag Search Filter for All Creators */}
      <AllCreatorsTagSearchFilter />

      <PostsClientInfiniteScroll
        key={refreshKey} // Force re-render when search params change
        {...{
          data: searchParamsObject, // Pass as data instead of searchParams
          col,
          isAdmin,
          mongoUser,
          className: "miw600 f g0",
        }}
      />
    </div>
  );
}
