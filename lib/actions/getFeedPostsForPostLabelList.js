"use server";

import { getAll } from "./crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import mongoose from "mongoose";

/**
 * Fetch feed posts for a post label list
 * @param {Array} feedPostIds - Array of feed post IDs (stored as postLabelIds in UserListsModel)
 * @returns {Array} Array of feed post objects
 */
export async function getFeedPostsForPostLabelList(feedPostIds) {
  try {
    const { mongoUser } = await getMongoUser();

    if (
      !mongoUser?._id ||
      !feedPostIds ||
      !Array.isArray(feedPostIds) ||
      feedPostIds.length === 0
    ) {
      console.log("❌ getFeedPostsForPostLabelList - Invalid input:", {
        hasMongoUser: !!mongoUser?._id,
        feedPostIds: feedPostIds?.length || 0,
        isArray: Array.isArray(feedPostIds),
      });
      return [];
    }

    // Convert feedPostIds to ObjectIds with proper validation
    const objectIds = [];
    for (const id of feedPostIds) {
      try {
        // Handle different input types
        let stringId = id;

        if (typeof id === "object" && id !== null) {
          // If it's a mongoose ObjectId, get its string representation
          if (id._id) {
            stringId = id._id.toString();
          } else if (id.$oid) {
            stringId = id.$oid; // MongoDB ObjectId JSON representation
          } else if (id.toString && typeof id.toString === "function") {
            stringId = id.toString();
          } else {
            console.warn(
              "❌ Unknown object type:",
              typeof id,
              JSON.stringify(id)
            );
            continue;
          }
        }

        // Validate if it's a valid ObjectId format
        if (mongoose.Types.ObjectId.isValid(stringId)) {
          objectIds.push(new mongoose.Types.ObjectId(stringId));
        } else {
          console.warn("❌ Invalid ObjectId format:", stringId);
        }
      } catch (error) {
        console.warn("❌ Error converting to ObjectId:", id, error.message);
      }
    }

    if (objectIds.length === 0) {
      console.log("❌ getFeedPostsForPostLabelList - No valid ObjectIds found");
      return [];
    }

    // Get the feed posts directly (no need to go through post labels)
    const feedPosts = await getAll({
      col: "feeds",
      data: {
        _id: { $in: objectIds },
        active: true,
      },
      populate: [
        {
          path: "createdBy",
          select:
            "name username displayName bio profileImage imageUrl avatar _id",
        },
        {
          path: "files",
          select: "fileUrl fileType blurredUrl isPaid fileName fileBytes tags",
        },
      ],
      sort: { createdAt: -1 },
    });

    if (!Array.isArray(feedPosts) || feedPosts.length === 0) {
      console.log("❌ getFeedPostsForPostLabelList - No feed posts found");
      return [];
    }

    // Serialize the posts and convert ObjectIds to strings
    const serializedPosts = feedPosts.map((post) => {
      const plainPost = post.toObject ? post.toObject() : post;

      // Convert ObjectIds to strings for client components
      if (plainPost._id) {
        plainPost._id = plainPost._id.toString();
      }
      if (plainPost.createdBy && plainPost.createdBy._id) {
        plainPost.createdBy._id = plainPost.createdBy._id.toString();
      }

      // Convert file ObjectIds to strings
      if (plainPost.files) {
        plainPost.files = plainPost.files.map((file) => ({
          ...file,
          _id: file._id ? file._id.toString() : file._id,
        }));
      }

      // Add post label metadata to indicate this came from a post label list
      plainPost._postLabelInfo = {
        isFromPostLabelList: true,
      };

      // Final JSON serialization to ensure all data is plain
      return JSON.parse(JSON.stringify(plainPost));
    });

    return serializedPosts;
  } catch (error) {
    console.error("❌ Error fetching feed posts for post label list:", error);
    return [];
  }
}
