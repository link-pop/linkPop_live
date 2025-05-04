import { getOne } from "@/lib/actions/crud";
import { createNotification } from "@/lib/utils/notifications/createNotification";
import extractMentions from "./extractMentions";

/**
 * Handles sending notifications to users mentioned in a comment
 * @param {string} commentText - The text of the comment
 * @param {string} commentId - The ID of the comment
 * @param {object} mongoUser - The current user
 * @param {string} postId - The ID of the post
 * @param {string} postType - The type of post
 * @param {object} socket - The socket instance
 * @returns {Promise<void>}
 */
export default async function handleMentionNotifications({
  commentText,
  commentId,
  mongoUser,
  postId,
  postType,
  socket,
}) {
  const mentionedUsernames = extractMentions(commentText);
  
  if (mentionedUsernames.length === 0) return;
  
  try {
    // For each mentioned username, find the user and send a notification
    for (const username of mentionedUsernames) {
      // Find the user by username
      const mentionedUser = await getOne({
        col: "users",
        data: { name: username },
      });
      
      // If user exists and is not the current user
      if (mentionedUser && mentionedUser._id.toString() !== mongoUser._id.toString()) {
        // Create notification for the mentioned user
        await createNotification({
          userId: mentionedUser._id,
          type: "mention",
          title: "You were mentioned",
          content: `${mongoUser.name || "Someone"} mentioned you in a comment: ${commentText.substring(0, 50)}${commentText.length > 50 ? "..." : ""}`,
          sourceId: commentId,
          sourceModel: "comments",
          sourceUserId: mongoUser._id,
          link: `/${postType}/${postId}`,
          socket,
        });
      }
    }
  } catch (error) {
    console.error("Error sending mention notifications:", error);
  }
}
