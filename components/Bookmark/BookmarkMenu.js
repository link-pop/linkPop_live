"use client";

import { useState } from "react";
import { Bookmark, BookmarkMinus, FolderInput } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/components/Context/TranslationContext";
import useBookmarkSelection from "@/hooks/useBookmarkSelection";
import BookmarkIcon from "./BookmarkIcon";
import { add, removeOne } from "@/lib/actions/crud";

export default function BookmarkMenu({
  post,
  mongoUser,
  col,
  postsPaginationType,
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  // Get the current bookmark state from the post
  const isBookmarked = post?.isBookmarkedPost || false;

  // Create a mock bookmark object for the selection hook
  const mockBookmark = {
    _id: post._id,
    postId: post._id,
  };

  const { showListSelectionDialog } = useBookmarkSelection({
    selectedBookmarks: [mockBookmark],
  });

  const handleBookmarkClick = async (e) => {
    e.stopPropagation();
    if (!mongoUser?._id || !post?._id) return;

    try {
      if (isBookmarked) {
        // If already bookmarked, just open the dropdown menu
        setIsOpen(true);
      } else {
        // Add bookmark first
        await add({
          col: "bookmarks",
          data: {
            userId: mongoUser._id,
            postId: post._id,
            postType: col.name,
          },
          revalidate:
            postsPaginationType === "infinite" ? null : `/${col.name}`,
        });

        // Update post state optimistically
        post.isBookmarkedPost = true;

        // Then open the dropdown menu
        setIsOpen(true);
      }
    } catch (error) {
      console.error("❌ Error handling bookmark:", error);
    }
  };

  const handleRemoveBookmark = async (e) => {
    e.stopPropagation();
    if (!mongoUser?._id || !post?._id) return;

    try {
      await removeOne({
        col: "bookmarks",
        data: {
          userId: mongoUser._id,
          postId: post._id,
          postType: col.name,
        },
        revalidate: postsPaginationType === "infinite" ? null : `/${col.name}`,
      });

      // Update post state optimistically
      post.isBookmarkedPost = false;
      setIsOpen(false);
    } catch (error) {
      console.error("❌ Error removing bookmark:", error);
    }
  };

  const handleAddToCollection = async (e) => {
    e.stopPropagation();
    console.log("🔍 BookmarkMenu: handleAddToCollection called");
    await showListSelectionDialog();
    setIsOpen(false);
  };

  return (
    <div className={`flex items-center ${className}`}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <button
            onClick={handleBookmarkClick}
            className="abounce f fwn aic g2 gray fz12"
            title={isBookmarked ? t("bookmarkOptions") : t("addBookmark")}
          >
            <BookmarkIcon isBookmarked={isBookmarked} className="mb7 w20 h20" />
          </button>
        </DropdownMenuTrigger>
        {isBookmarked && (
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={handleRemoveBookmark}
              className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <BookmarkMinus className="w16 h16 mr-2" />
              {t("removeBookmark")}
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
