"use client";

import { useState, useEffect, useMemo, useContext } from "react";
import { useSearchParams } from "next/navigation";
import useWindowWidth from "@/hooks/useWindowWidth";
import PostsLoader from "@/components/Post/Posts/PostsLoader";
import NoPosts from "@/components/Post/Posts/NoPosts";
import PostsDepOnMongoCollection from "@/components/Post/Posts/PostsDepOnMongoCollection";
import PostLabelsMediaTypeSwitch from "@/components/PostLabel/PostLabelsMediaTypeSwitch";
import { CollectionsContext } from "@/components/Context/CollectionsContext";

export default function PostLabelsDisplay({
  mongoUser,
  currentListId,
  currentListContext = null,
  isLoadingData = false,
  allPostLabels = [],
  customListFeedPosts = [],
  viewMode = "feeds",
}) {
  const [refreshKey, setRefreshKey] = useState(0);
  const searchParams = useSearchParams();
  const { isMobileSm } = useWindowWidth();
  const { postLabelViewMode } = useContext(CollectionsContext);

  // Use the view mode from context if available
  const currentViewMode = postLabelViewMode || viewMode;

  // Determine which data to show based on current list
  const displayData = useMemo(() => {
    console.log("🔍 PostLabelsDisplay - displayData calculation:", {
      currentListId,
      isCustom: currentListContext?.isCustom,
      allPostLabelsLength: allPostLabels?.length || 0,
      customListFeedPostsLength: customListFeedPosts?.length || 0,
    });

    if (currentListContext?.isCustom) {
      console.log("✅ PostLabelsDisplay - Using custom list feed posts");
      return customListFeedPosts;
    }

    switch (currentListId) {
      case "all-post-labels":
        console.log("✅ PostLabelsDisplay - Using all post labels");
        return allPostLabels;
      default:
        console.log("❌ PostLabelsDisplay - No matching list, returning empty");
        return [];
    }
  }, [currentListId, currentListContext, allPostLabels, customListFeedPosts]);

  // Process data to handle different sources (post labels vs feed posts)
  const processedPosts = useMemo(() => {
    console.log("🔍 PostLabelsDisplay - Processing data:", {
      currentListId,
      displayDataLength: displayData.length,
      isCustomList: currentListContext?.isCustom,
      sampleData: displayData[0]
        ? {
            id: displayData[0]._id,
            hasText: !!displayData[0].text,
            hasCreatedBy: !!displayData[0].createdBy,
            filesCount: displayData[0].files?.length || 0,
            hasPostLabelInfo: !!displayData[0]._postLabelInfo,
          }
        : null,
    });

    if (currentListContext?.isCustom) {
      // For custom lists, we get feed posts directly with post label metadata
      console.log(
        "✅ PostLabelsDisplay - Using direct feed posts:",
        displayData.length
      );
      return displayData;
    } else {
      // For system lists (all-post-labels), process post label objects
      return displayData
        .map((postLabelData, index) => {
          console.log(
            `🔍 PostLabelsDisplay - Processing post label ${index}:`,
            {
              postLabelId: postLabelData._id,
              hasPostId: !!postLabelData.postId,
              postIdType: typeof postLabelData.postId,
            }
          );

          // For post labels: post data is in postId field (already populated)
          if (
            postLabelData.postId &&
            typeof postLabelData.postId === "object"
          ) {
            const post = {
              ...postLabelData.postId,
              _postLabelInfo: {
                labeledAt: postLabelData.createdAt,
                postLabelId: postLabelData._id,
              },
            };

            console.log(
              `✅ PostLabelsDisplay - Successfully processed post label ${index} - Post ID: ${
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
              "❌ Post label postId not populated properly:",
              postLabelData._id
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
    if (currentViewMode === "attachments") {
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
  }, [processedPosts, currentViewMode, searchParams]);

  console.log("🔍 PostLabelsDisplay - Final processed posts:", {
    count: finalProcessedPosts.length,
    viewMode: currentViewMode,
    samplePost: finalProcessedPosts[0]
      ? {
          id: finalProcessedPosts[0]._id,
          text: finalProcessedPosts[0].text ? "HAS TEXT" : "NO TEXT",
          hasCreatedBy: !!finalProcessedPosts[0].createdBy,
          hasPostLabelInfo: !!finalProcessedPosts[0]._postLabelInfo,
          filesCount: finalProcessedPosts[0].files?.length || 0,
          firstFileUrl: finalProcessedPosts[0].files?.[0]?.fileUrl || "NO FILE",
        }
      : null,
    allPosts: finalProcessedPosts.map((post) => ({
      id: post._id,
      hasText: !!post.text,
      hasFiles: !!post.files?.length,
    })),
  });

  // Force refresh when search params change
  useEffect(() => {
    setRefreshKey((prev) => prev + 1);
  }, [currentListId, displayData, searchParams]);

  // Don't render main content if we're loading
  if (isLoadingData) {
    return <PostsLoader isLoading={true} />;
  }

  // ! don't show PostLabelsDisplay on mobile if not on userlistshub
  if (currentListId === "userlistshub" && isMobileSm) return null;

  return (
    <div className="PostLabelsDisplay">
      {/* Media Type Switch - Always show, regardless of data */}
      <PostLabelsMediaTypeSwitch
        mongoUser={mongoUser}
        allPostLabels={allPostLabels}
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
            name:
              currentViewMode === "attachments"
                ? "feedwithonlyimages"
                : "feeds",
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
            currentViewMode === "attachments"
              ? "f"
              : "fcc container aistr g10 !jcs !maw600"
          }`}
        />
      )}
    </div>
  );
}
