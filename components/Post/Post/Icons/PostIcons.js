"use client";

import PostLike from "../../../Like/PostLike";
import PostViews from "./PostViews";
import PostComment from "@/components/Comment/PostComment";
import CommentIcon from "@/components/Comment/CommentIcon";
import BookmarkMenu from "@/components/Bookmark/BookmarkMenu";
import PostLabelMenu from "@/components/PostLabel/PostLabelMenu";

export default function PostIcons({
  col,
  postsPaginationType,
  showLike = true,
  showBookmark = true,
  showPostLabel = true,
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
  // Check if current user is the owner of the post
  const isOwner =
    mongoUser &&
    post?.createdBy?._id &&
    mongoUser._id.toString() === post?.createdBy?._id.toString();

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
      {showBookmark && col.name === "feeds" && mongoUser && (
        <BookmarkMenu
          {...{
            col,
            mongoUser,
            postsPaginationType,
            post,
          }}
        />
      )}
      {showPostLabel && col.name === "feeds" && mongoUser && isOwner && (
        <PostLabelMenu
          {...{
            col,
            mongoUser,
            postsPaginationType,
            post,
          }}
        />
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
