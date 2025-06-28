import { getAll } from "@/lib/actions/crud";
import mongoose from "mongoose";

/**
 * Fetch all completed purchases for chatmessages
 * @param {Object} mongoUser - The current user
 * @param {string} colName - The collection name
 * @returns {Promise<Array>} - Array of all purchases for chatmessages
 */
export async function fetchAllChatMessagePurchases(mongoUser, colName) {
  if (!mongoUser || colName !== "chatmessages") {
    return [];
  }

  try {
    return await getAll({
      col: "purchases",
      data: {
        postType: "chatmessages",
        status: "completed",
      },
    });
  } catch (error) {
    console.error("❌ Error fetching chat message purchases:", error);
    return [];
  }
}

/**
 * Check if a message has any purchases from any user
 * @param {string} postId - The post ID to check
 * @param {Array} allPurchases - Array of all purchases
 * @returns {boolean} - Whether the message has any purchases
 */
export function hasMessageBeenPurchased(postId, allPurchases) {
  if (!postId || !allPurchases || allPurchases.length === 0) {
    return false;
  }

  return allPurchases.some((purchase) => {
    const purchasePostId = purchase.postId._id
      ? purchase.postId._id.toString()
      : purchase.postId.toString();
    return purchasePostId === postId.toString();
  });
}

/**
 * Check if current user has purchased a specific message
 * @param {string} postId - The post ID to check
 * @param {Array} userPurchases - Array of current user's purchases
 * @returns {boolean} - Whether the current user has purchased this message
 */
export function hasUserPurchasedMessage(postId, userPurchases) {
  return hasUserPurchasedPost(postId, userPurchases, "chatmessages");
}

/**
 * Process chat message files based on purchase status
 * @param {Array} files - Array of files to process
 * @param {Object} post - The post object
 * @param {boolean} hasPurchased - Whether user has purchased this message
 * @returns {Array} - Processed files array
 */
export function processChatMessageFiles(files, post, hasPurchased) {
  if (!files || files.length === 0) {
    return files;
  }

  return files.map((file) => {
    if (typeof file === "string" || !file) {
      return file;
    }

    // If post has a price and user hasn't purchased it
    if (post.price > 0 && !hasPurchased) {
      return {
        ...file,
        fileUrl: file.blurredUrl || null, // Use blurred URL if available, otherwise null
        hasPurchased: false,
      };
    }

    // User has purchased or post is not paid
    return {
      ...file,
      hasPurchased: post.price > 0 ? true : undefined,
    };
  });
}

/**
 * Process a chat message post with purchase logic
 * @param {Object} post - The post to process
 * @param {Object} processedPost - The processed post so far
 * @param {Object} mongoUser - The current user
 * @param {Array} allPurchases - All purchases for chat messages
 * @param {Array} userPurchases - Current user's purchases
 * @returns {Object} - Processed post with purchase information
 */
export function processChatMessagePost(
  post,
  processedPost,
  mongoUser,
  allPurchases,
  userPurchases
) {
  const postId =
    post._id instanceof mongoose.Types.ObjectId
      ? post._id
      : new mongoose.Types.ObjectId(post._id);

  // Check if the user is the creator of the message
  const isCreator =
    mongoUser &&
    post?.createdBy?._id &&
    mongoUser._id.toString() === post.createdBy._id.toString();

  // For the creator of a paid message, we need to check if ANYONE has purchased it
  if (isCreator && post.price > 0) {
    const hasAnyPurchases = hasMessageBeenPurchased(postId, allPurchases);

    return {
      ...processedPost,
      hasPurchased: hasAnyPurchases, // This will be used by the client to prevent deletion
    };
  }

  // If the user is the creator and message is not paid, they can see all content
  if (isCreator) {
    return processedPost;
  }

  // Handle files only if there are files
  if (post.files && post.files.length > 0) {
    const hasPurchased = hasUserPurchasedMessage(postId, userPurchases);
    const processedFiles = processChatMessageFiles(
      post.files,
      post,
      hasPurchased
    );

    return {
      ...processedPost,
      files: processedFiles,
      hasPurchased: hasPurchased,
    };
  }

  return processedPost;
}

/**
 * Process files based on subscription and purchase status (for non-owner view)
 * @param {Array} files - Array of files to process
 * @param {boolean} hasPurchased - Whether user has purchased the content
 * @param {boolean} isSubscribed - Whether user is subscribed to the creator
 * @param {boolean} isPaidContent - Whether the content requires payment
 * @returns {Array} - Processed files array
 */
export function processFilesForNonOwner(
  files,
  hasPurchased,
  isSubscribed,
  isPaidContent
) {
  if (!files || files.length === 0) {
    return files;
  }

  return files.map((file) => {
    if (typeof file === "string" || !file) {
      return file;
    }

    // If file is an object with fileUrl
    if (file.fileUrl) {
      // Case 1: User purchased the content - show full file
      if (hasPurchased) {
        return {
          ...file,
          isPaid: isPaidContent,
        };
      }

      // Case 2: User is subscribed but didn't purchase
      if (isSubscribed) {
        // Show full file only if it's not paid content
        if (!isPaidContent) {
          return file;
        } else {
          // For paid content, show blurred version
          return {
            ...file,
            fileUrl: file.blurredUrl || null,
            isPaid: true,
          };
        }
      }

      // Case 3: User is not subscribed - show blurred version
      return {
        ...file,
        fileUrl: file.blurredUrl || null,
        isPaid: true,
      };
    }

    return file;
  });
}

/**
 * Check if user has purchased a post (generic version for different post types)
 * @param {string} postId - The post ID to check
 * @param {Array} userPurchases - Array of current user's purchases
 * @param {string} postType - The type of post (optional, defaults to any)
 * @returns {boolean} - Whether the current user has purchased this post
 */
export function hasUserPurchasedPost(postId, userPurchases, postType = null) {
  if (!postId || !userPurchases || userPurchases.length === 0) {
    return false;
  }

  return userPurchases.some((purchase) => {
    // Check if purchase has the necessary properties
    if (!purchase.postId) return false;

    // Handle different formats of postId in purchases
    const purchasePostId = purchase.postId._id
      ? purchase.postId._id.toString()
      : purchase.postId.toString();

    const isMatchingPost = purchasePostId === postId.toString();

    // If postType is specified, also check that it matches
    const isMatchingType = postType ? purchase.postType === postType : true;

    return isMatchingPost && isMatchingType;
  });
}
