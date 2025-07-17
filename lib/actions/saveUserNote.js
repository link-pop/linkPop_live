"use server";

import { add, update, getOne } from "./crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";

export const saveUserNote = async ({ entityType, entityId, noteText }) => {
  try {
    const { mongoUser } = await getMongoUser();
    if (!mongoUser) {
      return { error: "User not authenticated" };
    }

    if (!entityType || !entityId) {
      return { error: "Entity type and ID are required" };
    }

    if (!noteText || noteText.trim().length === 0) {
      return { error: "Note text is required" };
    }

    if (noteText.trim().length > 1000) {
      return { error: "Note text cannot exceed 1000 characters" };
    }

    // Check if note already exists
    const existingNote = await getOne({
      col: "usernotes",
      data: {
        createdBy: mongoUser._id,
        entityType,
        entityId,
      },
    });

    let result;
    if (existingNote) {
      // Update existing note
      result = await update({
        col: "usernotes",
        data: { _id: existingNote._id },
        update: { noteText: noteText.trim() },
      });
    } else {
      // Create new note
      result = await add({
        col: "usernotes",
        data: {
          createdBy: mongoUser._id,
          entityType,
          entityId,
          noteText: noteText.trim(),
        },
      });
    }

    if (result.error) {
      return { error: result.error };
    }

    return { success: true, note: result };
  } catch (error) {
    console.error("❌ Error saving user note:", error);
    return { error: error.message || "Failed to save user note" };
  }
};
