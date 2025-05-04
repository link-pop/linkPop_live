"use server";

import { getAll } from "./crud";
import { fetchUserLikedPosts } from "./fetchUserLikedPosts";
import mongoose from "mongoose";
import { fetchUserHiddenPosts } from "./fetchUserHiddenPosts";
import { fetchHiddenUsers } from "./fetchHiddenUsers";
import { fetchUserPurchases } from "./fetchUserPurchases";
import { handleAttachmentsCollection } from "./handleAttachmentsCollection";
import { fetchUserSubscriptions, getSubscribedToUserIds } from "./fetchUserSubscriptions";

// TODO !!!!! make 1 common file that makes SIMILAR actions for getAllPostsNonOwner AND getAllPostsOwner
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
    return await handleAttachmentsCollection(args, sort, mongoUser);
  }

  const now = new Date();

  // * Add expiration and schedule filter to data
  const dataWithExpiration = {
    ...data,
    $and: [
      // Schedule filter
      {
        $or: [
          { scheduleAt: { $exists: false } },
          { scheduleAt: null },
          { scheduleAt: { $lte: now } },
        ],
      },
      // Expiration filter
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
              ],
            },
          },
        ],
      },
    ],
  };

  // Fetch liked posts, hidden posts, hidden users, user's completed purchases, and subscriptions
  const [
    posts,
    likedPostIds,
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
    mongoUser ? fetchUserHiddenPosts(mongoUser, "hiddenFeeds") : [],
    mongoUser ? fetchUserHiddenPosts(mongoUser, "hiddenMessages") : [],
    mongoUser ? fetchHiddenUsers(mongoUser) : [],
    // TODO !!!!! sep new fn
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

  // Add isLikedPost property only if hasLikes is enabled
  let postsWithLikes = col.settings?.hasLikes
    ? visiblePosts.map((post) => {
        const postId =
          post._id instanceof mongoose.Types.ObjectId
            ? post._id
            : new mongoose.Types.ObjectId(post._id);

        const isLiked = likedPostIds.some((likedId) => likedId.equals(postId));

        return {
          ...post,
          isLikedPost: isLiked,
        };
      })
    : visiblePosts;

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

      // Check if the user has purchased this post
      const hasPurchased = userPurchases.some(
        (purchase) =>
          (purchase.postId?._id?.toString() || purchase.postId?.toString()) ===
          postId.toString()
      );

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

      // Process files based on subscription and purchase status
      // Logic:
      // 1. If user purchased the content - show full file (regardless of subscription)
      // 2. If user is subscribed but didn't purchase - show full file only if it's not paid content
      // 3. If user is not subscribed - show blurred version of all files

      // Create a copy of the post with processed file information
      return {
        ...post,
        hasPurchased,
        isSubscribed,
        files: post.files.map((file) => {
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
        }),
      };
    });
  }

  return postsWithLikes;
};
