"use client";

import PostLike from "../../../Like/PostLike";
import PostViews from "./PostViews";
import { usePathname } from "next/navigation";
import PostComment from "@/components/Comment/PostComment";
import CommentIcon from "@/components/Comment/CommentIcon";

export default function PostIcons({
  col,
  postsPaginationType,
  showLike = true,
  showComment = false,
  mongoUser,
  showAdminIcons = true,
  isAdmin = false,
  post,
  className = "",
  adminIconsClassName = "",
  defaultShowComments,
  onCommentClick,
}) {
  // ! skip render if viewing another user's cart
  const pathname = usePathname();
  // Check if viewing a user profile directly from root (without /users/)
  if (pathname.match(/^\/[^\/]+$/)) return null;

  return (
    <div
      className={`if aic g8 br10 p5 px10 ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {showLike && col.settings?.hasLikes && (
        <>
          <PostViews {...{ post }} />
          <PostLike
            {...{
              col,
              mongoUser,
              postsPaginationType,
              post,
            }}
          />
        </>
      )}
      {showComment && col.settings?.hasComments && (
        <PostComment
          {...{
            col,
            mongoUser,
            postsPaginationType,
            post,
            defaultShowComments,
            onCommentClick,
          }}
        />
      )}
      {showComment && !col.settings?.hasComments && (
        <CommentIcon className="!gray" />
      )}
    </div>
  );
}
