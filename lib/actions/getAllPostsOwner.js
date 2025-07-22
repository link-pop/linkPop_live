"use server";

import { getAll } from "./crud";
import { fetchUserLikedPosts } from "./fetchUserLikedPosts";
import mongoose from "mongoose";
import { fetchUserHiddenPosts } from "./fetchUserHiddenPosts";
import { fetchHiddenUsers } from "./fetchHiddenUsers";
import { fetchUserPurchases } from "./fetchUserPurchases";
import { handleAttachmentsCollection } from "./handleAttachmentsCollection";
import { postsColPostProcessing } from "@/components/Post/Posts/PostsColSpecialHandling";
import {
  fetchAllChatMessagePurchases,
  processChatMessagePost,
} from "../utils/mongo/chatMessagePurchaseUtils";
import { getChatAttachments } from "./getChatAttachments";

export const getAllPostsOwner = async (args) => {
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
  const type = searchParams?.type;

  // Handle different post types for owner
  let typeFilter = {};

  if (type === "expiring") {
    typeFilter = {
      $or: [
        // Posts with expiration
        {
          expirationPeriod: { $exists: true, $ne: null },
        },
        // Scheduled posts that also have expiration
        {
          $and: [
            { scheduleAt: { $exists: true, $ne: null, $gt: now } },
            { expirationPeriod: { $exists: true, $ne: null } },
          ],
        },
      ],
    };
  } else if (type === "scheduled") {
    typeFilter = {
      $or: [
        // Scheduled posts
        {
          scheduleAt: { $exists: true, $ne: null, $gt: now },
        },
        // Expiring posts that also have schedule
        {
          $and: [
            { expirationPeriod: { $exists: true, $ne: null } },
            { scheduleAt: { $exists: true, $ne: null, $gt: now } },
          ],
        },
      ],
    };
  } else if (type === "archived") {
    typeFilter = {
      active: false,
    };
  } else if (type === "visible") {
    typeFilter = {
      active: true,
      $and: [
        // Not scheduled or schedule date passed
        {
          $or: [
            { scheduleAt: { $exists: false } },
            { scheduleAt: null },
            { scheduleAt: { $lte: now } },
          ],
        },
        // Not expired
        {
          $or: [
            { expirationPeriod: { $exists: false } },
            { expirationPeriod: null },
            {
              $expr: {
                $gt: [
                  {
                    $add: [
                      {
                        $cond: {
                          if: {
                            $and: [
                              { $ne: ["$scheduleAt", null] },
                              { $ne: [{ $type: "$scheduleAt" }, "missing"] },
                            ],
                          },
                          then: "$scheduleAt",
                          else: "$createdAt",
                        },
                      },
                      { $multiply: ["$expirationPeriod", 24 * 60 * 60 * 1000] },
                    ],
                  },
                  now,
                ],
              },
            },
          ],
        },
      ],
    };
  }
  // For "all" type, no additional filtering needed

  // Merge data properly to avoid overriding search filters
  // Special handling for chatrooms - don't apply type filters
  const dataWithFilters =
    col.name === "chatrooms"
      ? data
      : Object.keys(typeFilter).length > 0
      ? {
          $and: [...(data.$and || [data]), typeFilter],
        }
      : data;

  // Fetch liked posts, hidden posts, hidden users, user purchases, and all purchases for owned messages
  const [
    posts,
    likedPostIds,
    hiddenPostIds,
    hiddenMessageIds,
    hiddenUserIds,
    userPurchases,
    allPurchasesForOwnedMessages,
  ] = await Promise.all([
    getAll({ ...args, data: dataWithFilters, sort }),
    col.settings?.hasLikes && mongoUser
      ? fetchUserLikedPosts(mongoUser, col.name)
      : [],
    mongoUser ? fetchUserHiddenPosts(mongoUser, "hiddenFeeds") : [],
    mongoUser ? fetchUserHiddenPosts(mongoUser, "hiddenMessages") : [],
    mongoUser ? fetchHiddenUsers(mongoUser) : [],
    mongoUser ? fetchUserPurchases(mongoUser) : [],
    // Fetch all purchases for chatmessages using reusable function
    fetchAllChatMessagePurchases(mongoUser, col.name),
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

  // Process posts: add isLikedPost property and handle paid content
  const processedPosts = visiblePosts.map((post) => {
    const postId =
      post._id instanceof mongoose.Types.ObjectId
        ? post._id
        : new mongoose.Types.ObjectId(post._id);

    // Add isLikedPost property if hasLikes is enabled
    let processedPost = post;
    if (col.settings?.hasLikes) {
      const isLiked = likedPostIds.some((likedId) => likedId.equals(postId));
      processedPost = {
        ...processedPost,
        isLikedPost: isLiked,
      };
    }

    // Handle paid content for chat messages using reusable function
    if (col.name === "chatmessages") {
      return processChatMessagePost(
        post,
        processedPost,
        mongoUser,
        allPurchasesForOwnedMessages,
        userPurchases
      );
    }

    return processedPost;
  });

  // Apply post-processing for special collections (e.g., auction payment status for notifications)
  const finalProcessedPosts = await postsColPostProcessing(
    processedPosts,
    col,
    mongoUser
  );

  return finalProcessedPosts;
};
