import { getAll } from "./crud";
import { fetchUserPurchases } from "./fetchUserPurchases";
import {
  fetchUserSubscriptions,
  getSubscribedToUserIds,
} from "./fetchUserSubscriptions";

/**
 * Handles fetching and filtering attachments
 * @param {Object} args - Original arguments passed to getAllPostsNonOwner
 * @param {Object} sort - Sort configuration
 * @param {Object} mongoUser - The current user
 * @returns {Array} Filtered attachments
 */
export async function handleAttachmentsCollection(args, sort, mongoUser) {
  const { data = {}, searchParams = {} } = args;

  // Handle custom file URL filters first
  let queryData = { ...data };

  // Handle fileUrl_contains filter (for GIFs)
  if (queryData.fileUrl_contains) {
    queryData.fileUrl = { $regex: queryData.fileUrl_contains, $options: "i" };
    delete queryData.fileUrl_contains;
    console.log("✅ Applied fileUrl_contains filter:", queryData.fileUrl);
  }

  // Handle fileUrl_not_contains filter (for excluding GIFs from photos)
  if (queryData.fileUrl_not_contains) {
    queryData.fileUrl = {
      $not: { $regex: queryData.fileUrl_not_contains, $options: "i" },
    };
    delete queryData.fileUrl_not_contains;
    console.log("✅ Applied fileUrl_not_contains filter:", queryData.fileUrl);
  }

  // Handle tag filtering - check both data and searchParams
  // Get tags from either data or searchParams
  let tagsToFilter = data.tags || searchParams.tags;

  if (tagsToFilter && Array.isArray(tagsToFilter) && tagsToFilter.length > 0) {
    // Filter attachments that contain ALL of the specified tags with partial matching (intersection mode)
    // Create regex patterns for each tag to enable partial matching
    const regexPatterns = tagsToFilter.map((tag) => new RegExp(tag, "i")); // 'i' for case-insensitive
    queryData.tags = { $all: regexPatterns };
    console.log(
      "✅ Filtering attachments by tags (intersection mode with partial matching):",
      tagsToFilter
    );
  } else {
    // Remove tags from query if no tags to filter by
    delete queryData.tags;
    console.log("❌ No tags to filter by - removed tags from query");
  }

  console.log("handleAttachmentsCollection - searchParams:", searchParams);
  console.log("handleAttachmentsCollection - data:", data);
  console.log("handleAttachmentsCollection - final queryData:", queryData);

  // Fetch all attachments based on the query
  const attachments = await getAll({ ...args, data: queryData, sort });

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
