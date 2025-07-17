"use server";

import { removeOne } from "./crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";

export const deleteUserNote = async ({ entityType, entityId }) => {
  try {
    const { mongoUser } = await getMongoUser();
    if (!mongoUser) {
      return { error: "User not authenticated" };
    }

    if (!entityType || !entityId) {
      return { error: "Entity type and ID are required" };
    }

    const result = await removeOne({
      col: "usernotes",
      data: {
        createdBy: mongoUser._id,
        entityType,
        entityId,
      },
    });

    if (result.error) {
      return { error: result.error };
    }

    return { success: true };
  } catch (error) {
    console.error("❌ Error deleting user note:", error);
    return { error: error.message || "Failed to delete user note" };
  }
};
