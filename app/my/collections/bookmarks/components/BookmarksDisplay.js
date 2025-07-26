"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import useWindowWidth from "@/hooks/useWindowWidth";
import PostsLoader from "@/components/Post/Posts/PostsLoader";
import NoPosts from "@/components/Post/Posts/NoPosts";
import PostsDepOnMongoCollection from "@/components/Post/Posts/PostsDepOnMongoCollection";
import BookmarksMediaTypeSwitch from "@/components/Bookmark/BookmarksMediaTypeSwitch";

export default function BookmarksDisplay({
  mongoUser,
  currentListId,
  currentListContext = null,
  isLoadingData = false,
  allBookmarks = [],
  customListFeedPosts = [],
  viewMode = "feeds",
}) {
  const [refreshKey, setRefreshKey] = useState(0);
  const searchParams = useSearchParams();
  const { isMobileSm } = useWindowWidth();

  // Determine which data to show based on current list
  const displayData = useMemo(() => {
    if (currentListContext?.isCustom) {
      return customListFeedPosts;
    }

    switch (currentListId) {
      case "all-bookmarks":
        return allBookmarks;
      default:
        return [];
    }
  }, [currentListId, currentListContext, allBookmarks, customListFeedPosts]);

  // Process data to handle different sources (bookmarks vs feed posts)
  const processedPosts = useMemo(() => {
    console.log("🔍 BookmarksDisplay - Processing data:", {
      currentListId,
      displayDataLength: displayData.length,
      isCustomList: currentListContext?.isCustom,
      sampleData: displayData[0]
        ? {
            id: displayData[0]._id,
            hasText: !!displayData[0].text,
            hasCreatedBy: !!displayData[0].createdBy,
            filesCount: displayData[0].files?.length || 0,
            hasBookmarkInfo: !!displayData[0]._bookmarkInfo,
          }
        : null,
    });

    if (currentListContext?.isCustom) {
      // For custom lists, we get feed posts directly with bookmark metadata
      console.log(
        "✅ BookmarksDisplay - Using direct feed posts:",
        displayData.length
      );
      return displayData;
    } else {
      // For system lists (all-bookmarks), process bookmark objects
      return displayData
        .map((bookmarkData, index) => {
          console.log(`🔍 BookmarksDisplay - Processing bookmark ${index}:`, {
            bookmarkId: bookmarkData._id,
            hasPostId: !!bookmarkData.postId,
            postIdType: typeof bookmarkData.postId,
          });

          // For bookmarks: post data is in postId field (already populated)
          if (bookmarkData.postId && typeof bookmarkData.postId === "object") {
            const post = {
              ...bookmarkData.postId,
              _bookmarkInfo: {
                bookmarkedAt: bookmarkData.createdAt,
                bookmarkId: bookmarkData._id,
              },
            };

            console.log(
              `✅ BookmarksDisplay - Successfully processed bookmark ${index} - Post ID: ${
                post._id
              }, Files: ${post.files?.length || 0}`,
              post.files?.[0]
                ? {
                    firstFileUrl: post.files[0].fileUrl,
                    firstFileType: post.files[0].fileType,
                  }
                : "No files"
            );
            return post;
          } else {
            console.warn(
              "❌ Bookmark postId not populated properly:",
              bookmarkData._id
            );
            return null; // Skip this invalid entry
          }
        })
        .filter(Boolean); // Remove null entries
    }
  }, [displayData, currentListContext]);

  // Filter posts based on view mode and media type
  const finalProcessedPosts = useMemo(() => {
    let filteredPosts = processedPosts;

    // First filter by view mode
    if (viewMode === "attachments") {
      // In attachment mode, only show posts that have files
      filteredPosts = filteredPosts.filter(
        (post) => post.files && post.files.length > 0
      );
    }

    // Then filter by media type if specified
    const mediaTypeParam = searchParams.get("mediaType");
    if (mediaTypeParam && mediaTypeParam !== "all") {
      filteredPosts = filteredPosts.filter((post) => {
        if (!post.files || post.files.length === 0) return false;

        return post.files.some((file) => {
          if (mediaTypeParam === "video") {
            return file.fileType === "video";
          } else if (mediaTypeParam === "photo") {
            return file.fileType === "image" && !file.fileUrl?.includes(".gif");
          } else if (mediaTypeParam === "gif") {
            return file.fileType === "image" && file.fileUrl?.includes(".gif");
          }
          return true;
        });
      });
    }

    return filteredPosts;
  }, [processedPosts, viewMode, searchParams]);

  console.log("🔍 BookmarksDisplay - Final processed posts:", {
    count: finalProcessedPosts.length,
    viewMode,
    samplePost: finalProcessedPosts[0]
      ? {
          id: finalProcessedPosts[0]._id,
          text: finalProcessedPosts[0].text ? "HAS TEXT" : "NO TEXT",
          hasCreatedBy: !!finalProcessedPosts[0].createdBy,
          hasBookmarkInfo: !!finalProcessedPosts[0]._bookmarkInfo,
          filesCount: finalProcessedPosts[0].files?.length || 0,
          firstFileUrl: finalProcessedPosts[0].files?.[0]?.fileUrl || "NO FILE",
        }
      : null,
  });

  // Force refresh when search params change
  useEffect(() => {
    setRefreshKey((prev) => prev + 1);
  }, [currentListId, displayData, searchParams]);

  // Don't render main content if we're loading
  if (isLoadingData) {
    return <PostsLoader isLoading={true} />;
  }

  // ! don't show BookmarksDisplay on mobile if not on userlistshub
  if (currentListId === "userlistshub" && isMobileSm) return null;

  return (
    <div className="BookmarksDisplay">
      {/* Media Type Switch - Always show, regardless of data */}
      <BookmarksMediaTypeSwitch
        mongoUser={mongoUser}
        allBookmarks={allBookmarks}
        customListFeedPosts={customListFeedPosts}
        currentListContext={currentListContext}
        className="mb15"
      />

      {/* Show empty state if no data */}
      {!finalProcessedPosts || finalProcessedPosts.length === 0 ? (
        <NoPosts />
      ) : (
        <PostsDepOnMongoCollection
          posts={finalProcessedPosts}
          postsFoundNum={finalProcessedPosts.length}
          col={{
            name: viewMode === "attachments" ? "bookmarkattachments" : "feeds",
            settings: { hasLikes: true, hasComments: true },
          }}
          isAdmin={false}
          postsPaginationType="infinite"
          hasMore={false}
          mongoUser={mongoUser}
          searchParams={{}}
          showFoundNum={false}
          showCategories={false}
          isLoading={false}
          className={`!p0 !m0 my15 ${
            viewMode === "attachments"
              ? "f"
              : "fcc container aistr g10 !jcs !maw600"
          }`}
        />
      )}
    </div>
  );
}
