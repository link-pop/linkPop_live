"use server";

import { update } from "./crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";

export async function updateUserList(listId, updateData) {
  try {
    const { mongoUser } = await getMongoUser();

    if (!mongoUser) {
      return { error: "User not authenticated" };
    }

    if (!listId) {
      return { error: "List ID is required" };
    }

    // Generate slug from name if name is being updated
    if (updateData.name) {
      updateData.slug = updateData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
    }

    // Update the user list (only if owned by current user)
    const result = await update({
      col: "userlists",
      data: {
        _id: listId,
        createdBy: mongoUser._id,
        isSystemList: false, // Prevent updating system lists
      },
      update: {
        ...updateData,
        updatedAt: new Date(),
      },
    });

    if (result.error) {
      return { error: result.error };
    }

    return { success: true, list: result };
  } catch (error) {
    console.error("❌ Error updating user list:", error);

    // Handle duplicate slug error
    if (error.code === 11000) {
      return { error: "A list with this name already exists" };
    }

    return { error: "Failed to update user list" };
  }
}
