"use server";

import { getAll } from "./crud";
import { fetchUserLikedPosts } from "./fetchUserLikedPosts";
import mongoose from "mongoose";
import { fetchUserHiddenPosts } from "./fetchUserHiddenPosts";
import { fetchHiddenUsers } from "./fetchHiddenUsers";
import { fetchUserPurchases } from "./fetchUserPurchases";

// TODO !!!!! make 1 common file that makes SIMILAR actions for getAllPostsNonOwner AND getAllPostsOwner
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

  const dataWithFilters = {
    ...data,
    ...(Object.keys(typeFilter).length > 0 ? typeFilter : {}),
  };

  // Fetch liked posts, hidden posts, hidden users, and user purchases
  const [posts, likedPostIds, hiddenPostIds, hiddenMessageIds, hiddenUserIds, userPurchases] =
    await Promise.all([
    getAll({ ...args, data: dataWithFilters, sort }),
    col.settings?.hasLikes && mongoUser
      ? fetchUserLikedPosts(mongoUser, col.name)
      : [],
    mongoUser ? fetchUserHiddenPosts(mongoUser, "hiddenFeeds") : [],
    mongoUser ? fetchUserHiddenPosts(mongoUser, "hiddenMessages") : [],
    mongoUser ? fetchHiddenUsers(mongoUser) : [],
    mongoUser ? fetchUserPurchases(mongoUser) : [],
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

    // Handle paid content for chat messages
    if (col.name === "chatmessages" && post.files && post.files.length > 0) {
      // Check if the user is the creator of the message
      const isCreator = mongoUser && post?.createdBy?._id && 
        mongoUser._id.toString() === post.createdBy._id.toString();

      // If the user is the creator, they can see all content
      if (isCreator) {
        return processedPost;
      }

      // Check if the user has purchased this message
      const hasPurchased = userPurchases.some(
        (purchase) => {
          // Check if purchase has the necessary properties
          if (!purchase.postId) return false;
          
          // Handle different formats of postId in purchases
          const purchasePostId = purchase.postId._id 
            ? purchase.postId._id.toString() 
            : purchase.postId.toString();
          
          const isMatch = purchasePostId === postId.toString() && 
                 purchase.postType === "chatmessages";
            
          return isMatch;
        }
      );

      // Process files based on purchase status
      const processedFiles = post.files.map((file) => {
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

      return {
        ...processedPost,
        files: processedFiles,
        hasPurchased: hasPurchased,
      };
    }

    return processedPost;
  });

  return processedPosts;
};
