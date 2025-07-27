"use server";

import { update } from "./crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import mongoose from "mongoose";

export async function addPostLabelsToPostLabelList(listId, feedPostIds) {
  try {
    const { mongoUser } = await getMongoUser();

    if (!mongoUser?._id) {
      return { error: "User not authenticated" };
    }

    if (
      !listId ||
      !feedPostIds ||
      !Array.isArray(feedPostIds) ||
      feedPostIds.length === 0
    ) {
      return { error: "Invalid list ID or feed post IDs" };
    }

    // Convert feedPostIds to ObjectIds
    const objectIds = feedPostIds.map((id) =>
      id instanceof mongoose.Types.ObjectId
        ? id
        : new mongoose.Types.ObjectId(id)
    );

    // First, create post label records for each feed post
    const { add } = await import("./crud");
    const createdPostLabels = [];

    for (const postId of objectIds) {
      try {
        // Check if post label already exists
        const { getOne } = await import("./crud");
        const existingPostLabel = await getOne({
          col: "postlabels",
          data: {
            userId: new mongoose.Types.ObjectId(mongoUser._id),
            postId: postId,
            postType: "feeds",
          },
        });

        if (!existingPostLabel) {
          // Create new post label record
          const postLabel = await add({
            col: "postlabels",
            data: {
              userId: mongoUser._id,
              postId: postId,
              postType: "feeds",
            },
          });

          if (postLabel && !postLabel.error) {
            console.log("✅ Created post label for post:", postId.toString());
          }
        } else {
          console.log(
            "✅ Post label already exists for post:",
            postId.toString()
          );
        }
      } catch (error) {
        console.error(
          "❌ Error creating post label for post:",
          postId.toString(),
          error
        );
      }
    }

    // Add feed post IDs to the list (not post label IDs)
    const result = await update({
      col: "userlists",
      data: {
        _id: new mongoose.Types.ObjectId(listId),
        createdBy: new mongoose.Types.ObjectId(mongoUser._id),
        targetCollection: "postlabels", // Ensure it's a post label list
      },
      update: {
        $addToSet: {
          postLabelIds: { $each: objectIds }, // Use feed post IDs, not post label IDs
        },
      },
      skipOwnershipCheck: false, // We want to verify ownership
    });

    if (result.error) {
      console.log("❌ Error updating post label list:", result.error);
      return { error: result.error };
    }

    console.log("✅ Successfully added post labels to list");
    return { success: true };
  } catch (error) {
    console.error("❌ Error adding post labels to list:", error);
    return { error: "Failed to add post labels to list" };
  }
}
