import { getAll } from "@/lib/actions/crud";
import mongoose from "mongoose";

/**
 * Get the last 3 user profile images from a list of user IDs
 * @param {Array} userIds - Array of user IDs (can be strings or ObjectIds)
 * @returns {Array} Array of profile image URLs (max 3)
 */
export async function getLastUserProfileImages(userIds) {
  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return [];
  }

  try {
    // Handle mixed formats - convert all to strings for consistent querying
    const normalizedUserIds = userIds
      .map((userId) => {
        if (typeof userId === "string") {
          return userId;
        } else if (userId && typeof userId === "object" && userId._id) {
          return userId._id.toString();
        } else if (userId && userId.toString) {
          return userId.toString();
        }
        return null;
      })
      .filter(Boolean);

    if (normalizedUserIds.length === 0) {
      return [];
    }

    // Try to convert to ObjectIds for the query, but handle invalid IDs gracefully
    const objectIds = [];
    const stringIds = [];

    normalizedUserIds.forEach((id) => {
      try {
        if (mongoose.Types.ObjectId.isValid(id)) {
          objectIds.push(new mongoose.Types.ObjectId(id));
        } else {
          stringIds.push(id);
        }
      } catch (error) {
        stringIds.push(id);
      }
    });

    // Build query to handle both ObjectIds and strings
    let query = {};

    if (objectIds.length > 0 && stringIds.length > 0) {
      // Mixed case - query for both ObjectIds and strings
      query = {
        $or: [{ _id: { $in: objectIds } }, { _id: { $in: stringIds } }],
      };
    } else if (objectIds.length > 0) {
      // Only ObjectIds
      query = { _id: { $in: objectIds } };
    } else if (stringIds.length > 0) {
      // Only strings
      query = { _id: { $in: stringIds } };
    } else {
      return [];
    }

    // Get the last 3 users with profile images
    const users = await getAll({
      col: "users",
      data: query,
      sort: { _id: -1 }, // Get latest users first
      limit: 3,
    });

    if (!Array.isArray(users)) {
      return [];
    }

    // Extract profile image URLs
    const profileImages = users
      .map((user) => user.profileImage || user.imageUrl || user.avatar)
      .filter((image) => image && image.trim() !== "")
      .slice(0, 3); // Ensure max 3 images

    return profileImages;
  } catch (error) {
    console.error("❌ Error fetching last user profile images:", error);
    return [];
  }
}
