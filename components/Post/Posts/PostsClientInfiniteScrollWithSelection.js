"use client";

import React from "react";
import Carousel from "@/components/ui/shared/Carousel/Carousel";
import PostsClientInfiniteScroll from "./PostsClientInfiniteScroll";
import useAttachmentSelection from "@/hooks/useAttachmentSelection";
import { Circle, CircleCheck } from "lucide-react";

export default function PostsClientInfiniteScrollWithSelection(props) {
  // Custom posts component that adds selection functionality
  const customPostsComponent = ({ posts }) => {
    posts = props.posts || posts;

    const {
      selectedAttachments,
      toggleAttachmentSelection,
      isAttachmentSelected,
      SelectionControls,
    } = useAttachmentSelection({ allAttachments: posts });

    if (!posts || posts.length === 0) {
      return null;
    }

    return (
      <div className="relative w-full">
        <SelectionControls />

        {/* Grid of attachments with selection */}
        <div className="grid grid-cols-3 gap-4 w-full">
          {posts.map((post) => {
            const isSelected = isAttachmentSelected(post._id);
            return (
              <div
                key={post._id}
                className="cursor-pointer relative aspect-square group"
                onClick={() => toggleAttachmentSelection(post)}
              >
                <Carousel
                  files={[{ fileUrl: post.fileUrl, fileType: post.fileType }]}
                  showThumbnails={false}
                  showIndicators={false}
                  showArrows={false}
                  imageClassName="w-full h-full object-cover rounded-md"
                />
                <div
                  className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-background/60 text-foreground group-hover:bg-background/80"
                  }`}
                >
                  {isSelected ? (
                    <CircleCheck className="brand w-4 h-4" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <PostsClientInfiniteScroll
      {...props}
      customPostsComponent={customPostsComponent}
    />
  );
}
