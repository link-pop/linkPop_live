"use server";

import { update } from "./crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import mongoose from "mongoose";

export async function renameUserList(listId, { name, description = "" }) {
  try {
    const { mongoUser } = await getMongoUser();

    if (!mongoUser) {
      return { error: "User not authenticated" };
    }

    // Validate required fields
    if (!name || !listId) {
      return { error: "Name and list ID are required" };
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    // Update the user list
    const updatedList = await update({
      col: "userlists",
      data: {
        _id: listId,
        createdBy: new mongoose.Types.ObjectId(mongoUser._id), // Ensure user can only rename their own lists
      },
      update: {
        name: name.trim(),
        description: description.trim(),
        slug,
      },
    });

    // Check if update returned an error
    if (updatedList && updatedList.error) {
      return { error: updatedList.error };
    }

    if (!updatedList) {
      return { error: "Failed to update user list or list not found" };
    }

    const plainList = JSON.parse(JSON.stringify(updatedList));

    return { success: true, list: plainList };
  } catch (error) {
    console.error("❌ Error renaming user list:", error);

    // Handle duplicate slug error
    if (error.code === 11000) {
      return { error: "A list with this name already exists" };
    }

    return { error: "Failed to rename user list" };
  }
}
