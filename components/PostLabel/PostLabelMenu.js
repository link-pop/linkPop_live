"use client";

import { useState } from "react";
import { Tag, X, FolderInput } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/components/Context/TranslationContext";
import usePostLabelSelection from "@/hooks/usePostLabelSelection";
import PostLabelIcon from "./PostLabelIcon";
import { add, removeOne } from "@/lib/actions/crud";

export default function PostLabelMenu({
  post,
  mongoUser,
  col,
  postsPaginationType,
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  // Get the current post label state from the post
  const isLabeled = post?.isLabeledPost || false;

  // Create a mock post label object for the selection hook
  const mockPostLabel = {
    _id: post._id,
    postId: post._id,
  };

  const { showListSelectionDialog } = usePostLabelSelection({
    selectedPostLabels: [mockPostLabel],
  });

  const handlePostLabelClick = async (e) => {
    e.stopPropagation();
    if (!mongoUser?._id || !post?._id) return;

    try {
      if (isLabeled) {
        // If already labeled, just open the dropdown menu
        setIsOpen(true);
      } else {
        // Add post label first
        await add({
          col: "postlabels",
          data: {
            userId: mongoUser._id,
            postId: post._id,
            postType: col.name,
          },
          revalidate:
            postsPaginationType === "infinite" ? null : `/${col.name}`,
        });

        // Update post state optimistically
        post.isLabeledPost = true;

        // Then open the dropdown menu
        setIsOpen(true);
      }
    } catch (error) {
      console.error("❌ Error handling post label:", error);
    }
  };

  const handleRemovePostLabel = async (e) => {
    e.stopPropagation();
    if (!mongoUser?._id || !post?._id) return;

    try {
      await removeOne({
        col: "postlabels",
        data: {
          userId: mongoUser._id,
          postId: post._id,
          postType: col.name,
        },
        revalidate: postsPaginationType === "infinite" ? null : `/${col.name}`,
      });

      // Update post state optimistically
      post.isLabeledPost = false;
      setIsOpen(false);
    } catch (error) {
      console.error("❌ Error removing post label:", error);
    }
  };

  const handleAddToCollection = async (e) => {
    e.stopPropagation();
    console.log("🔍 PostLabelMenu: handleAddToCollection called");
    await showListSelectionDialog();
    setIsOpen(false);
  };

  return (
    <div className={`flex items-center ${className}`}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <button
            onClick={handlePostLabelClick}
            className="abounce f fwn aic g2 gray fz12"
            title={isLabeled ? t("postLabelOptions") : t("addPostLabel")}
          >
            <PostLabelIcon isLabeled={isLabeled} className="mb7 w20 h20" />
          </button>
        </DropdownMenuTrigger>
        {isLabeled && (
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={handleRemovePostLabel}
              className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="w16 h16 mr-2" />
              {t("removePostLabel")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleAddToCollection}
              className="cursor-pointer"
            >
              <FolderInput className="w16 h16 mr-2" />
              {t("addToCollection")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        )}
      </DropdownMenu>
    </div>
  );
}
