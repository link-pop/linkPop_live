/**
 * Client-side utility to check if a chat message can be deleted or hidden
 * @param {Object} post - The chat message post object
 * @param {Object} mongoUser - The current user
 * @param {string} action - The action being performed ('delete' or 'hide')
 * @returns {boolean} - Whether the action is allowed
 */
export function canMessageBeModified(post, mongoUser, action = "delete") {
  // If no post or user, don't allow modification
  if (!post || !mongoUser) {
    return false;
  }

  // Check if this is a chatmessage
  if (!post.chatRoomId && !post.chatMsgText) {
    return true; // Not a chat message, allow normal rules
  }

  // Check if the message is a paid message
  const isPaidMessage = post.price && post.price > 0;

  // If it's not a paid message, allow modification
  if (!isPaidMessage) {
    return true;
  }

  // For paid messages, check if it has been purchased
  // The `hasPurchased` flag from the server indicates if the message has any purchases
  // Note: For owner's messages, we need to check if anyone has purchased it
  // The backend should set this flag based on completed purchases
  const hasPurchases = post.hasPurchased === true;

  // If it's a paid message that has been purchased, don't allow deletion or hiding
  if (isPaidMessage && hasPurchases) {
    return false;
  }

  // For other cases, allow the modification
  return true;
}
