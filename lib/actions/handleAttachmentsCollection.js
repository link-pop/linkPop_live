import { getAll } from "./crud";
import { fetchUserPurchases } from "./fetchUserPurchases";
import { fetchUserSubscriptions, getSubscribedToUserIds } from "./fetchUserSubscriptions";

/**
 * Handles fetching and filtering attachments
 * @param {Object} args - Original arguments passed to getAllPostsNonOwner
 * @param {Object} sort - Sort configuration
 * @param {Object} mongoUser - The current user
 * @returns {Array} Filtered attachments
 */
export async function handleAttachmentsCollection(args, sort, mongoUser) {
  const { data = {} } = args;

  // Fetch all attachments based on the query
  const attachments = await getAll({ ...args, sort });

  // If no user is logged in, filter out all paid attachments
  if (!mongoUser) {
    return attachments.filter((attachment) => !attachment.isPaid);
  }

  // If user is logged in, check if they're the creator or have purchased the content
  const [userPurchases, userSubscriptions] = await Promise.all([
    fetchUserPurchases(mongoUser),
    fetchUserSubscriptions(mongoUser),
  ]);

  // Create a set of user IDs the current user is subscribed to for faster lookups
  const subscribedToUserIds = getSubscribedToUserIds(userSubscriptions);

  // Process each attachment
  return await Promise.all(
    attachments.map(async (attachment) => {
      // If user is the creator, they can see all their attachments
      if (
        attachment.createdBy &&
        mongoUser._id.toString() === attachment.createdBy.toString()
      ) {
        return attachment;
      }

      // For all attachments, check if user has purchased the related post
      let relatedPostId = attachment.relatedPostId;

      // Check if user has purchased the related post
      const hasPurchased =
        relatedPostId &&
        userPurchases.some(
          (purchase) =>
            purchase.postId &&
            purchase.postId.toString() === relatedPostId.toString()
        );

      // If purchased, return the full attachment regardless of subscription status
      if (hasPurchased) {
        return {
          ...attachment,
          hasPurchased: true,
          isSubscribed: false, // Not needed since purchase takes precedence
        };
      }

      // Check if the attachment is from a creator the user is subscribed to
      // First, get the creator ID from the related post if available
      let creatorId = null;
      if (attachment.createdBy) {
        creatorId = attachment.createdBy.toString();
      }

      // Check if user is subscribed to the creator
      const isSubscribed = creatorId && subscribedToUserIds.has(creatorId);

      // If attachment is not paid and user is subscribed, show it
      if (!attachment.isPaid && isSubscribed) {
        return {
          ...attachment,
          hasPurchased: false,
          isSubscribed: true,
        };
      }

      // Otherwise, return the attachment with the blurred URL
      // This covers:
      // 1. Paid attachments when user is subscribed but hasn't purchased
      // 2. All attachments (paid or not) when user is not subscribed
      return {
        ...attachment,
        fileUrl: attachment.blurredUrl || null,
        hasPurchased: false,
        isSubscribed: isSubscribed || false,
      };
    })
  );
}
