"use server";

import { getAll } from "./crud";
import { fetchUserLikedPosts } from "./fetchUserLikedPosts";
import { fetchUserBookmarkedPosts } from "./fetchUserBookmarkedPosts";
import mongoose from "mongoose";
import { fetchUserHiddenPosts } from "./fetchUserHiddenPosts";
import { fetchHiddenUsers } from "./fetchHiddenUsers";
import { fetchUserPurchases } from "./fetchUserPurchases";
import { handleAttachmentsCollection } from "./handleAttachmentsCollection";
import {
  fetchUserSubscriptions,
  getSubscribedToUserIds,
} from "./fetchUserSubscriptions";
import { postsColPostProcessing } from "@/components/Post/Posts/PostsColSpecialHandling";
import {
  processFilesForNonOwner,
  hasUserPurchasedPost,
} from "../utils/mongo/chatMessagePurchaseUtils";
import { getChatAttachments } from "./getChatAttachments";
import { getPostLabelList } from "./getPostLabelList";

// * gets all posts for non-owner user: eg don't show EXPIRED/ARCHIVED/NOT-YET-SCHEDULE-READY posts
export const getAllPostsNonOwner = async (args) => {
  // * if smth needed to be found: pass it to data, but NOT AS SEPARATE arg
  const { col, searchParams, mongoUser, sort: passedSort, data = {} } = args;

  // Handle sort parameter
  let sort = passedSort || { createdAt: -1 };

  // Override with URL search params sort if present
  if (searchParams?.sort) {
    const [field, order] = searchParams.sort.split(":");
    const parsedOrder = parseInt(order);
    // Only set the sort if it's a valid order (-1 or 1)
    if (parsedOrder === -1 || parsedOrder === 1) {
      sort = { [field]: parsedOrder };
    }
  }

  // Special handling for attachments collection
  if (col.name === "attachments") {
    // Check if this is a chat gallery request
    if (data?.isChatGallery && data.chatId) {
      // Extract filters from data
      const filters = {};
      if (data.fileType) filters.fileType = data.fileType;
      if (data.fileUrl_contains)
        filters.fileUrl_contains = data.fileUrl_contains;
      if (data.fileUrl_not_contains)
        filters.fileUrl_not_contains = data.fileUrl_not_contains;
      if (data?.tags) filters.tags = data?.tags;

      return await getChatAttachments(data.chatId, filters, mongoUser);
    }

    return await handleAttachmentsCollection(args, sort, mongoUser);
  }

  const now = new Date();

    // Handle post label filtering if specified
  let postLabelFilter = {};
  if (searchParams?.postLabel && searchParams.postLabel !== "all") {
    const postLabelIds = await getPostLabelList(searchParams.postLabel);
    
    if (postLabelIds && postLabelIds.length > 0) {
      postLabelFilter = {
        _id: { $in: postLabelIds }
      };
    } else {
      return [];
    }
  }

  // * create data object for filtering - properly merge with existing data
  // Special handling for chatrooms - don't apply expiration/schedule filters
  const dataWithExpiration =
    col.name === "chatrooms"
      ? { ...data, ...postLabelFilter }
      : {
          ...data,
          ...postLabelFilter,
          active: { $ne: false },
          $and: [
            ...(data.$and || []),
            // * Schedule filter - only show if not scheduled or schedule time passed
            {
              $or: [
                { scheduleAt: { $exists: false } },
                { scheduleAt: null },
                { scheduleAt: { $lte: now } },
              ],
            },
            // * Expiration filter - only show if not expired
            {
              $or: [
                { expirationPeriod: { $exists: false } },
                { expirationPeriod: null },
                { expirationPeriod: 0 },
                // * Not expired yet: now < (scheduleAt || createdAt) + (expirationPeriod * days)
                {
                  $expr: {
                    $lt: [
                      now,
                      {
                        $add: [
                          {
                            $cond: {
                              if: {
                                $and: [
                                  { $ne: ["$scheduleAt", null] },
                                  {
                                    $ne: [{ $type: "$scheduleAt" }, "missing"],
                                  },
                                ],
                              },
                              then: "$scheduleAt",
                              else: "$createdAt",
                            },
                          },
                          {
                            $multiply: [
                              "$expirationPeriod",
                              24 * 60 * 60 * 1000,
                            ],
                          },
                        ],
                      },
                    ],
                  },
                },
              ],
            },
          ],
        };

  // Fetch liked posts, bookmarked posts, hidden posts, hidden users, user's completed purchases, and subscriptions
  const [
    posts,
    likedPostIds,
    bookmarkedPostIds,
    hiddenPostIds,
    hiddenMessageIds,
    hiddenUserIds,
    userPurchases,
    userSubscriptions,
  ] = await Promise.all([
    getAll({ ...args, data: dataWithExpiration, sort }),
    col?.settings?.hasLikes && mongoUser
      ? fetchUserLikedPosts(mongoUser, col.name)
      : [],
    col.name === "feeds" && mongoUser
      ? fetchUserBookmarkedPosts(mongoUser, col.name)
      : [],
    mongoUser ? fetchUserHiddenPosts(mongoUser, "hiddenFeeds") : [],
    mongoUser ? fetchUserHiddenPosts(mongoUser, "hiddenMessages") : [],
    mongoUser ? fetchHiddenUsers(mongoUser) : [],
    mongoUser ? fetchUserPurchases(mongoUser) : [],
    // Fetch user subscriptions if user is logged in
    mongoUser ? fetchUserSubscriptions(mongoUser) : [],
  ]);

  // Check if posts is an array
  if (!Array.isArray(posts)) {
    console.error("Error fetching posts:", posts);
    return [];
  }

  // Filter out hidden posts and posts from hidden users
  const visiblePosts = posts.filter((post) => {
    const postId =
      post._id instanceof mongoose.Types.ObjectId
        ? post._id
        : new mongoose.Types.ObjectId(post._id);

    const userId =
      post?.createdBy?._id instanceof mongoose.Types.ObjectId
        ? post?.createdBy?._id
        : new mongoose.Types.ObjectId(post?.createdBy?._id);

    // Filter out if post is hidden or if post's author is hidden or if message is hidden
    return (
      !hiddenPostIds.some((hiddenId) => hiddenId.equals(postId)) &&
      !hiddenUserIds.some((hiddenId) => hiddenId.equals(userId)) &&
      !hiddenMessageIds.some((hiddenId) => hiddenId.equals(postId))
    );
  });

  // Add isLikedPost and isBookmarkedPost properties
  let postsWithLikes = visiblePosts.map((post) => {
    const postId =
      post._id instanceof mongoose.Types.ObjectId
        ? post._id
        : new mongoose.Types.ObjectId(post._id);

    let processedPost = post;

    // Add isLikedPost property only if hasLikes is enabled
    if (col.settings?.hasLikes) {
      const isLiked = likedPostIds.some((likedId) => likedId.equals(postId));
      processedPost = {
        ...processedPost,
        isLikedPost: isLiked,
      };
    }

    // Add isBookmarkedPost property for feeds collection
    if (col.name === "feeds") {
      const isBookmarked = bookmarkedPostIds.some((bookmarkedId) =>
        bookmarkedId.equals(postId)
      );
      processedPost = {
        ...processedPost,
        isBookmarkedPost: isBookmarked,
      };
    }

    return processedPost;
  });

  // If user is logged in, process posts to handle paid content and subscription-based content
  if (mongoUser) {
    // Create a set of user IDs the current user is subscribed to for faster lookups
    const subscribedToUserIds = getSubscribedToUserIds(userSubscriptions);

    postsWithLikes = postsWithLikes.map((post) => {
      // If user is the creator, they can see all their content
      const creatorId = post?.createdBy?._id?.toString();
      const isCreator = creatorId && mongoUser._id.toString() === creatorId;

      if (isCreator) {
        return post;
      }

      const postId =
        post._id instanceof mongoose.Types.ObjectId
          ? post._id
          : new mongoose.Types.ObjectId(post._id);

      // Check if the post is paid content
      const isPaidContent = post.price && post.price > 0;

      // Check if the user has purchased this post using reusable function
      const hasPurchased = hasUserPurchasedPost(postId, userPurchases);

      // Check if user is subscribed to the creator
      const isSubscribed = creatorId && subscribedToUserIds.has(creatorId);

      // If there are no files to process, just return the post with flags
      if (!post.files || post.files.length === 0) {
        return {
          ...post,
          hasPurchased,
          isSubscribed,
        };
      }

      // Process files using reusable function
      const processedFiles = processFilesForNonOwner(
        post.files,
        hasPurchased,
        isSubscribed,
        isPaidContent
      );

      // Create a copy of the post with processed file information
      return {
        ...post,
        hasPurchased,
        isSubscribed,
        files: processedFiles,
      };
    });
  }

  // Apply post-processing for special collections (e.g., auction payment status for notifications)
  const processedPosts = await postsColPostProcessing(
    postsWithLikes,
    col,
    mongoUser
  );

  return processedPosts;
};
