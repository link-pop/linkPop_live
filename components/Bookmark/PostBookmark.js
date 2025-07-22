"use client";

import { useEffect, useState } from "react";
import { add, removeOne } from "@/lib/actions/crud";
import BookmarkIcon from "@/components/Bookmark/BookmarkIcon";
import { useRequireAuth } from "@/lib/utils/auth/useRequireAuth";

export default function PostBookmark({
  col,
  mongoUser,
  postsPaginationType,
  post,
}) {
  const { isBookmarkedPost, _id: postId } = post;
  const [isBookmarked, setIsBookmarked] = useState(isBookmarkedPost);
  const [loading, setLoading] = useState(false);
  const noLoggedInUser = useRequireAuth();

  useEffect(() => {
    setIsBookmarked(isBookmarkedPost);
  }, [isBookmarkedPost, postId]);

  const handleBookmark = async (e) => {
    e.stopPropagation();
    if (noLoggedInUser()) return;

    try {
      setLoading(true);
      const newIsBookmarked = !isBookmarked;
      setIsBookmarked(newIsBookmarked);

      if (newIsBookmarked) {
        await add({
          col: "bookmarks",
          data: {
            userId: mongoUser._id,
            postId,
            postType: col.name,
          },
          revalidate:
            postsPaginationType === "infinite" ? null : `/${col.name}`,
        });
      } else {
        await removeOne({
          col: "bookmarks",
          data: {
            userId: mongoUser._id,
            postId,
            postType: col.name,
          },
          revalidate:
            postsPaginationType === "infinite" ? null : `/${col.name}`,
        });
      }
    } catch (error) {
      // Revert optimistic update on error
      setIsBookmarked(!isBookmarked);
      console.error("❌ Error toggling bookmark:", error);
    } finally {
      setLoading(false);
    }
  };

  const bookmarkClassName = "w20 h20";

  if (loading) {
    return (
      <button className="opacity-50">
        <BookmarkIcon className={bookmarkClassName} />
      </button>
    );
  }

  return (
    <button
      onClick={handleBookmark}
      className="asfs rounded-full transition-colors duration-200"
      disabled={loading}
    >
      <div className="abounce f fwn aic g2 gray fz12">
        <BookmarkIcon
          className={`hover:fill-yellow-300 ${bookmarkClassName}`}
          isBookmarked={isBookmarked}
        />
      </div>
    </button>
  );
}
