"use server";

import { getOne } from "./crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";

export const getUserNote = async ({ entityType, entityId }) => {
  try {
    const { mongoUser } = await getMongoUser();
    if (!mongoUser) {
      return { error: "User not authenticated" };
    }

    if (!entityType || !entityId) {
      return { error: "Entity type and ID are required" };
    }

    const note = await getOne({
      col: "usernotes",
      data: {
        createdBy: mongoUser._id,
        entityType,
        entityId,
      },
    });

    return { success: true, note };
  } catch (error) {
    console.error("❌ Error getting user note:", error);
    return { error: error.message || "Failed to get user note" };
  }
};
