"use server";

import { getAll } from "./crud";
import mongoose from "mongoose";

/**
 * Fetch users for a custom list, handling both string and ObjectId formats
 * @param {Array} userIds - Array of user IDs (can be strings or ObjectIds)
 * @returns {Array} Array of user objects
 */
export async function getUsersForCustomList(userIds) {
  try {
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return [];
    }

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

    const users = await getAll({
      col: "users",
      data: query,
      sort: { createdAt: -1 },
    });

    return Array.isArray(users) ? users : [];
  } catch (error) {
    console.error("❌ Error fetching users for custom list:", error);
    return [];
  }
}
