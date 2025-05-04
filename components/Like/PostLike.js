"use client";

import { useEffect, useState } from "react";
import { update, add, removeOne, getOne } from "@/lib/actions/crud";
import LikeIcon from "@/components/Like/LikeIcon";
import { useRequireAuth } from "@/lib/utils/auth/useRequireAuth";
import { createNotification } from "@/lib/utils/notifications/createNotification";
import { useChat } from "@/components/Context/ChatContext";
import removeHtmlFromText from "@/lib/utils/removeHtmlFromText";

export default function PostLike({
  col,
  mongoUser,
  postsPaginationType,
  post,
}) {
  const { isLikedPost, _id: postId, likes } = post;
  const [isLiked, setIsLiked] = useState(isLikedPost);
  const [likesCount, setLikesCount] = useState(likes);
  const [loading, setLoading] = useState(false);
  const noLoggedInUser = useRequireAuth();
  const { socket } = useChat();

  useEffect(() => {
    setIsLiked(isLikedPost);
    setLikesCount(likes);
  }, [isLikedPost, postId, likes]);

  // TODO !!!!! similar fn in AddCommentForm
  // Helper function to extract post content for notifications
  const getPostContent = (postDetails) => {
    let postContent = "";
    if (postDetails.title) {
      postContent = postDetails.title;
    } else if (postDetails.content) {
      postContent =
        postDetails.content.substring(0, 50) +
        (postDetails.content.length > 50 ? "..." : "");
    } else if (postDetails.chatMsgText) {
      postContent =
        postDetails.chatMsgText.substring(0, 50) +
        (postDetails.chatMsgText.length > 50 ? "..." : "");
    } else if (postDetails.text) {
      postContent =
        postDetails.text.substring(0, 50) +
        (postDetails.text.length > 50 ? "..." : "");
    }
    return postContent;
  };

  // Helper function to send notification
  const sendNotification = async (postDetails, isLike) => {
    // Only send notification if post owner is not the current user
    if (
      !postDetails ||
      !postDetails.createdBy ||
      !postDetails.createdBy._id ||
      postDetails.createdBy._id.toString() === mongoUser._id.toString()
    ) {
      return;
    }

    const postContent = getPostContent(postDetails);
    const notificationType = isLike ? "like" : "unlike";
    const notificationTitle = isLike ? "New Like" : "Unlike";
    const actionText = isLike ? "liked" : "unliked";

    await createNotification({
      userId: postDetails.createdBy._id,
      type: notificationType,
      title: notificationTitle,
      content: `${
        mongoUser.name || mongoUser.username || "Someone"
      } ${actionText} your post: ${removeHtmlFromText(postContent)}`,
      sourceId: postId,
      sourceModel: col.name,
      sourceUserId: mongoUser._id,
      link: `/${col.name}/${postId}`,
      socket,
    });
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (noLoggedInUser()) return;

    try {
      setLoading(true);
      const newIsLiked = !isLiked;
      setIsLiked(newIsLiked);
      setLikesCount((prev) => prev + (newIsLiked ? 1 : -1));

      if (newIsLiked) {
        await add({
          col: "likes",
          data: {
            userId: mongoUser._id,
            postId,
            postType: col.name,
          },
          revalidate:
            postsPaginationType === "infinite" ? null : `/${col.name}`,
        });

        await update({
          col: col.name,
          data: { _id: postId },
          update: { $inc: { likes: 1 } },
          revalidate:
            postsPaginationType === "infinite" ? null : `/${col.name}`,
        });

        // Send like notification
        await sendNotification(post, true);
      } else {
        await removeOne({
          col: "likes",
          data: {
            userId: mongoUser._id,
            postId,
            postType: col.name,
          },
          revalidate:
            postsPaginationType === "infinite" ? null : `/${col.name}`,
        });

        await update({
          col: col.name,
          data: { _id: postId },
          update: { $inc: { likes: -1 } },
          revalidate:
            postsPaginationType === "infinite" ? null : `/${col.name}`,
        });

        // Send unlike notification
        await sendNotification(post, false);
      }
    } catch (error) {
      // Revert optimistic update on error
      setIsLiked(!isLiked);
      setLikesCount((prev) => prev + (isLiked ? 1 : -1));
      console.error("Error toggling like:", error);
    } finally {
      setLoading(false);
    }
  };

  const likeClassName = "w20 h20";

  if (loading) {
    return (
      <button className="opacity-50">
        <LikeIcon className={likeClassName} />
      </button>
    );
  }

  return (
    <button
      onClick={handleLike}
      className="asfs rounded-full transition-colors duration-200"
      disabled={loading}
      // title={mongoUser ? "Like" : "Sign in to like"}
    >
      <div className="abounce f fwn aic g2 gray fz12">
        <LikeIcon
          className={`hover:fill-red-300 ${likeClassName}`}
          isLiked={isLiked}
        />
        {likesCount > 0 && likesCount}
      </div>
    </button>
  );
}
