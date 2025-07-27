"use server";

import { update } from "./crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import mongoose from "mongoose";

export async function removePostLabelsFromPostLabelList(listId, postLabelIds) {
  try {
    const { mongoUser } = await getMongoUser();

    if (!mongoUser?._id) {
      return { error: "User not authenticated" };
    }

    if (
      !listId ||
      !postLabelIds ||
      !Array.isArray(postLabelIds) ||
      postLabelIds.length === 0
    ) {
      return { error: "Invalid list ID or post label IDs" };
    }

    // Convert postLabelIds to ObjectIds
    const objectIds = postLabelIds.map((id) =>
      id instanceof mongoose.Types.ObjectId
        ? id
        : new mongoose.Types.ObjectId(id)
    );

    // Remove post labels from the list using $pull
    console.log("🔍 Removing post labels from list:", {
      listId,
      postLabelIds: objectIds.map((id) => id.toString()),
      userId: mongoUser._id.toString(),
    });

    const result = await update({
      col: "userlists",
      data: {
        _id: new mongoose.Types.ObjectId(listId),
        createdBy: new mongoose.Types.ObjectId(mongoUser._id),
        targetCollection: "postlabels", // Ensure it's a post label list
      },
      update: {
        $pull: {
          postLabelIds: { $in: objectIds },
        },
      },
      skipOwnershipCheck: false, // We want to verify ownership
    });

    if (result.error) {
      console.log("❌ Error updating post label list:", result.error);
      return { error: result.error };
    }

    console.log("✅ Successfully removed post labels from list");
    return { success: true };
  } catch (error) {
    console.error("❌ Error removing post labels from list:", error);
    return { error: "Failed to remove post labels from list" };
  }
}
