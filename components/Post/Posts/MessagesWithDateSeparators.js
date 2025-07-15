"use client";

import { useMemo } from "react";
import { groupMessagesByDate } from "@/lib/utils/formatMessageDate";
import { useTranslation } from "@/components/Context/TranslationContext";
import DateSeparator from "@/components/ui/shared/DateSeparator/DateSeparator";
import Post from "@/components/Post/Post/Post";

/**
 * MessagesWithDateSeparators component
 * Renders messages with date separators between different days
 */
export default function MessagesWithDateSeparators({
  posts,
  col,
  mongoUser,
  isAdmin,
  postsPaginationType,
  setCommentTextState,
  onReply,
  searchQuery,
  className = "",
}) {
  const { currentLang } = useTranslation();

  // Group messages with date separators
  const groupedItems = useMemo(() => {
    return groupMessagesByDate(posts || [], currentLang);
  }, [posts, currentLang]);

  const renderPost = (post) => {
    let CustomPostComponent;
    try {
      // Import custom component based on collection name
      // name must look like this: eg: ChatmessagePost for "chatmessages" collection
      const componentName = `${
        col.name.charAt(0).toUpperCase() + col.name.slice(1, -1)
      }Post`;

      // Use dynamic import with absolute path
      CustomPostComponent =
        require(`@/components/Post/Post/Custom/${componentName}`).default;

      return (
        <CustomPostComponent
          key={post._id}
          {...{
            post,
            mongoUser,
            col,
            isAdmin,
            postsPaginationType,
            setCommentTextState,
            onReply,
            searchQuery,
          }}
        />
      );
    } catch (error) {
      console.log(
        "Falling back to default Post for collection:",
        col.name,
        "Error:",
        error.message
      );
      // Fall back to default Post if custom component doesn't exist
      return (
        <Post
          key={post._id}
          {...{ post, mongoUser, col, isAdmin, postsPaginationType }}
        />
      );
    }
  };

  if (!posts || posts.length === 0) return null;

  return (
    <div className={className}>
      {groupedItems.map((item) => {
        if (item.type === "dateSeparator") {
          return (
            <DateSeparator
              key={item.id}
              dateString={item.dateString}
              className="mx-4"
            />
          );
        } else {
          // It's a message
          return renderPost(item);
        }
      })}
    </div>
  );
}
