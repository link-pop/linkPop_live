"use client";

import { useState } from "react";
import { add, update } from "@/lib/actions/crud";
import { useRequireAuth } from "@/lib/utils/auth/useRequireAuth";
import { SendHorizontal } from "lucide-react";
import AddEmoji from "./AddEmoji";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/components/Context/TranslationContext";
import { createNotification } from "@/lib/utils/notifications/createNotification";
import { useChat } from "@/components/Context/ChatContext";
import handleEmojiClick from "./utils/handleEmojiClick";
import handleMentionNotifications from "./utils/handleMentionNotifications";

export default function AddCommentForm({
  col,
  mongoUser,
  postsPaginationType,
  postId,
  postType,
  text,
  setText,
  addCommentFormTextareaRef,
  post,
}) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const noLoggedInUser = useRequireAuth();
  const queryClient = useQueryClient();
  const { socket } = useChat();

  // ! handle emoji
  const onEmojiClick = (emoji) => {
    handleEmojiClick(emoji, addCommentFormTextareaRef, setText);
  };
  // ? handle emoji

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (noLoggedInUser()) return;
    if (!text.trim()) return;

    try {
      setLoading(true);

      // * add comment
      const comment = await add({
        col: "comments",
        data: {
          createdBy: mongoUser._id,
          postId,
          postType,
          text: text.trim(),
        },
        revalidate: postsPaginationType === "infinite" ? null : `/${postType}`,
      });

      // * update post comments num
      await update({
        col: postType,
        data: { _id: postId },
        update: { $inc: { comments: 1 } },
        revalidate: postsPaginationType === "infinite" ? null : `/${postType}`,
      });

      // Get post details to find the owner
      const postDetails = post;

      // Create notification for post owner if it's not the current user
      if (
        postDetails &&
        postDetails.createdBy &&
        postDetails.createdBy._id &&
        postDetails.createdBy._id.toString() !== mongoUser._id.toString()
      ) {
        // Get post title or use first part of content
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

        // Create notification
        await createNotification({
          userId: postDetails.createdBy._id,
          type: "comment",
          title: "New Comment",
          content: `${
            mongoUser.name || mongoUser.username || "Someone"
          } commented on your post: ${text.trim().substring(0, 50)}${
            text.trim().length > 50 ? "..." : ""
          }`,
          sourceId: comment._id,
          sourceModel: "comments",
          sourceUserId: mongoUser._id,
          link: `/${postType}/${postId}`,
          socket, // Pass the socket instance
        });
      }

      // Handle notifications for mentioned users
      await handleMentionNotifications({
        commentText: text.trim(),
        commentId: comment._id,
        mongoUser,
        postId,
        postType,
        socket,
      });

      setText("");

      // Invalidate all posts queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-accent/80 dark:bg-accent/30 br10 px10 pos b0 l0 opacity-100 fc fwn g15 mb15"
      onClick={(e) => e.stopPropagation()} // prevent page jump to top: clicked FeedPost Link
    >
      {mongoUser && <AddEmoji onEmojiClick={onEmojiClick} />}
      <div className="f fwn g15 mb15">
        <textarea
          ref={addCommentFormTextareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={mongoUser ? t("addComment") : t("signInToComment")}
          disabled={!mongoUser || loading}
          className="w-full p-2 border border-border rounded-lg resize-none h-20 focus:outline-none focus:ring-2 focus:ring-brand bg-background text-foreground"
        />
        <button
          type="submit"
          disabled={!mongoUser || loading || !text.trim()}
          className="fcc !h40 !w42 bg-accent rf br50 disabled:opacity-20"
        >
          <SendHorizontal />
        </button>
      </div>
    </form>
  );
}
