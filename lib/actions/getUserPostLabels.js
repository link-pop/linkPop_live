"use server";

import { getAll } from "./crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import mongoose from "mongoose";

export async function getUserPostLabels() {
  try {
    const { mongoUser } = await getMongoUser();

    if (!mongoUser?._id) {
      return [];
    }

    console.log("🔍 getUserPostLabels - Starting for user:", mongoUser._id);

    const postLabels = await getAll({
      col: "postlabels",
      data: {
        userId: new mongoose.Types.ObjectId(mongoUser._id),
      },
      populate: [
        {
          path: "postId",
          populate: [
            {
              path: "createdBy",
              select:
                "name username displayName bio profileImage imageUrl avatar _id",
            },
            {
              path: "files",
              select:
                "fileUrl fileType blurredUrl isPaid fileName fileBytes tags",
            },
          ],
        },
      ],
      sort: { createdAt: -1 },
    });

    // Debug logging to verify population worked
    if (postLabels && postLabels.length > 0) {
      console.log(
        "🔍 getUserPostLabels - Total post labels:",
        postLabels.length
      );

      // Check first post label in detail
      const firstPostLabel = postLabels[0];
      console.log("🔍 getUserPostLabels - First post label structure:", {
        postLabelId: firstPostLabel._id,
        userId: firstPostLabel.userId,
        postIdType: typeof firstPostLabel.postId,
        postIdHasData:
          firstPostLabel.postId && typeof firstPostLabel.postId === "object",
        postText: firstPostLabel.postId?.text || "NO TEXT",
        createdByExists: !!firstPostLabel.postId?.createdBy,
        createdByName: firstPostLabel.postId?.createdBy?.name || "NO NAME",
        filesCount: firstPostLabel.postId?.files?.length || 0,
        firstFileUrl: firstPostLabel.postId?.files?.[0]?.fileUrl || "NO FILE",
      });

      // Check if population worked properly
      const populatedCount = postLabels.filter(
        (postLabel) =>
          postLabel.postId &&
          typeof postLabel.postId === "object" &&
          postLabel.postId.text &&
          postLabel.postId.createdBy
      ).length;

      console.log(
        "🔍 getUserPostLabels - Properly populated post labels:",
        populatedCount
      );
      console.log(
        "🔍 getUserPostLabels - Population success rate:",
        `${populatedCount}/${postLabels.length} (${Math.round(
          (populatedCount / postLabels.length) * 100
        )}%)`
      );
    } else {
      console.log("🔍 getUserPostLabels - No post labels found");
    }

    // Properly serialize Mongoose documents to plain objects
    const serializedPostLabels = Array.isArray(postLabels)
      ? postLabels.map((postLabel) => {
          // Convert Mongoose document to plain object
          const plainPostLabel = postLabel.toObject
            ? postLabel.toObject()
            : postLabel;

          // Ensure nested populated fields are also converted
          if (plainPostLabel.postId && plainPostLabel.postId.toObject) {
            plainPostLabel.postId = plainPostLabel.postId.toObject();

            // Also handle nested createdBy if it exists
            if (
              plainPostLabel.postId.createdBy &&
              plainPostLabel.postId.createdBy.toObject
            ) {
              plainPostLabel.postId.createdBy =
                plainPostLabel.postId.createdBy.toObject();
            }

            // Handle nested files if they exist
            if (
              plainPostLabel.postId.files &&
              Array.isArray(plainPostLabel.postId.files)
            ) {
              plainPostLabel.postId.files = plainPostLabel.postId.files.map(
                (file) => (file.toObject ? file.toObject() : file)
              );
            }
          }

          // Convert ObjectIds to strings for client components
          if (plainPostLabel._id) {
            plainPostLabel._id = plainPostLabel._id.toString();
          }
          if (plainPostLabel.userId) {
            plainPostLabel.userId = plainPostLabel.userId.toString();
          }
          if (plainPostLabel.postId && plainPostLabel.postId._id) {
            plainPostLabel.postId._id = plainPostLabel.postId._id.toString();
          }
          if (
            plainPostLabel.postId &&
            plainPostLabel.postId.createdBy &&
            plainPostLabel.postId.createdBy._id
          ) {
            plainPostLabel.postId.createdBy._id =
              plainPostLabel.postId.createdBy._id.toString();
          }

          // Convert file ObjectIds to strings
          if (plainPostLabel.postId && plainPostLabel.postId.files) {
            plainPostLabel.postId.files = plainPostLabel.postId.files.map(
              (file) => ({
                ...file,
                _id: file._id ? file._id.toString() : file._id,
              })
            );
          }

          // Final JSON serialization to ensure all data is plain
          return JSON.parse(JSON.stringify(plainPostLabel));
        })
      : [];

    console.log(
      "🔍 getUserPostLabels - Serialized post labels count:",
      serializedPostLabels.length
    );

    return serializedPostLabels;
  } catch (error) {
    console.error("❌ Error fetching user post labels:", error);
    return [];
  }
}
