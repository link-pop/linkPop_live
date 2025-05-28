"use server";

import { aggregate } from "./crud";
import mongoose from "mongoose";

/**
 * Get popular tags from a user's attachments
 * @param {string} userId - The user's MongoDB ID
 * @param {number} limit - Maximum number of tags to return (default: 50)
 * @returns {Promise<Array>} Array of popular tags sorted by frequency
 */
export async function getUserPopularTags(userId, limit = 50) {
  if (!userId) {
    return [];
  }

  try {
    // Convert userId string to ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // MongoDB aggregation pipeline to get popular tags
    const pipeline = [
      // Match attachments for this user
      {
        $match: {
          createdBy: userObjectId,
          tags: { $exists: true, $ne: [] }, // Only include documents with non-empty tags
        },
      },
      // Unwind the tags array to create separate documents for each tag
      {
        $unwind: "$tags",
      },
      // Group by tag and count occurrences
      {
        $group: {
          _id: "$tags",
          count: { $sum: 1 },
        },
      },
      // Sort by count in descending order (most popular first)
      {
        $sort: { count: -1 },
      },
      // Limit the results
      {
        $limit: limit,
      },
      // Project to return just the tag name
      {
        $project: {
          tag: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ];

    const results = await aggregate({
      col: "attachments",
      pipeline,
    });

    // Handle error case
    if (results?.error) {
      console.error("Error getting popular tags:", results.error);
      return [];
    }

    // Extract just the tag names
    return results.map((item) => item.tag).filter(Boolean);
  } catch (error) {
    console.error("Error in getUserPopularTags:", error);
    return [];
  }
}
