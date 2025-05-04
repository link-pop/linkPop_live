"use client";

import CommentIcon from "./CommentIcon";

// ! this is icon, not component where components are fetched
export default function PostComment({ col, mongoUser, post, onCommentClick }) {
  const { comments: commentsNum = 0 } = post;

  const handleClick = (e) => {
    e.stopPropagation();
    if (onCommentClick) {
      onCommentClick();
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className="rounded-full transition-colors duration-200"
        title={mongoUser ? "Comment" : "Sign in to comment"}
      >
        {/* ICON THAT TOGGLES COMMENTS ON/OFF */}
        <div className="abounce f aic g2 gray fz12">
          <CommentIcon />
          <span className="">{commentsNum}</span>
        </div>
      </button>
    </div>
  );
}
