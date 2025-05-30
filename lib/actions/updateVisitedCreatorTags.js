"use server";

import { connectToDb } from "../db/connectToDb";
import { models } from "../db/models/models";
import { handleError } from "../utils/errorHandling";
import { sendErrorToAdmin } from "./sendErrorToAdmin";

/**
 * Update user's lastVisitedCreatorsTags with new creator tags
 * @param {string} userId - User ID
 * @param {Object} creatorTags - Object with raceEthnicity, hairColor, bodyType, gender, age arrays
 * @returns {Promise<Object>} Result of the operation
 */
export const updateVisitedCreatorTags = async ({ userId, creatorTags }) => {
  if (!userId || !creatorTags) {
    return { error: "User ID and creator tags are required" };
  }

  try {
    await connectToDb();

    // Get the model from our models object
    const Model = models["users"];
    if (!Model) {
      throw new Error("User model not found");
    }

    // Get current user data
    const user = await Model.findById(userId).lean();
    if (!user) {
      return { error: "User not found" };
    }

    // Initialize lastVisitedCreatorsTags if it doesn't exist
    const currentTags = user.lastVisitedCreatorsTags || {
      raceEthnicity: [],
      hairColor: [],
      bodyType: [],
      gender: [],
      age: [],
    };

    // Update each category, keeping only the last 10 tags
    const updatedTags = {
      raceEthnicity: [...currentTags.raceEthnicity],
      hairColor: [...currentTags.hairColor],
      bodyType: [...currentTags.bodyType],
      gender: [...currentTags.gender],
      age: [...currentTags.age],
    };

    // Add new tags to the beginning and keep only last 10
    if (creatorTags.raceEthnicity && creatorTags.raceEthnicity.length > 0) {
      updatedTags.raceEthnicity = [
        ...creatorTags.raceEthnicity,
        ...updatedTags.raceEthnicity,
      ].slice(0, 10);
    }

    if (creatorTags.hairColor && creatorTags.hairColor.length > 0) {
      updatedTags.hairColor = [
        ...creatorTags.hairColor,
        ...updatedTags.hairColor,
      ].slice(0, 10);
    }

    if (creatorTags.bodyType && creatorTags.bodyType.length > 0) {
      updatedTags.bodyType = [
        ...creatorTags.bodyType,
        ...updatedTags.bodyType,
      ].slice(0, 10);
    }

    if (creatorTags.gender && creatorTags.gender.length > 0) {
      updatedTags.gender = [...creatorTags.gender, ...updatedTags.gender].slice(
        0,
        10
      );
    }

    if (creatorTags.age && creatorTags.age.length > 0) {
      updatedTags.age = [...creatorTags.age, ...updatedTags.age].slice(0, 10);
    }

    // Update the user document
    const updatedUser = await Model.findByIdAndUpdate(
      userId,
      { lastVisitedCreatorsTags: updatedTags },
      { new: true }
    ).lean();

    if (!updatedUser) {
      return { error: "Failed to update user visited creator tags" };
    }

    return { success: true, lastVisitedCreatorsTags: updatedTags };
  } catch (err) {
    console.error("Error updating visited creator tags:", err);
    await sendErrorToAdmin({
      error: err,
      subject: "Update Visited Creator Tags Error",
      context: { userId, creatorTags },
    });
    return handleError(err, "updateVisitedCreatorTags", {
      userId,
      creatorTags,
    });
  }
};
