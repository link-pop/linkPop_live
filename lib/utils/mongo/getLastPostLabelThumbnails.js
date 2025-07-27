import { getAll } from "@/lib/actions/crud";
import mongoose from "mongoose";

export async function getLastPostLabelThumbnails(feedPostIds) {
  try {
    console.log("🔍 getLastPostLabelThumbnails called with:", {
      feedPostIdsLength: feedPostIds?.length || 0,
      sampleIds: feedPostIds?.slice(0, 3),
      isArray: Array.isArray(feedPostIds),
    });

    if (
      !feedPostIds ||
      !Array.isArray(feedPostIds) ||
      feedPostIds.length === 0
    ) {
      return [];
    }

    // Get the last 3 feed post IDs to fetch thumbnails for
    const lastThreeFeedPostIds = feedPostIds.slice(-3);

    // Convert to ObjectIds with proper validation
    const objectIds = [];
    for (const id of lastThreeFeedPostIds) {
      try {
        let stringId = id;

        if (typeof id === "object" && id !== null) {
          // If it's a mongoose ObjectId, get its string representation
          if (id._id) {
            stringId = id._id.toString();
          } else if (id.$oid) {
            stringId = id.$oid; // MongoDB ObjectId JSON representation
          } else if (id.toString && typeof id.toString === "function") {
            stringId = id.toString();
          } else {
            console.warn(
              "❌ Unknown object type in thumbnails:",
              typeof id,
              JSON.stringify(id)
            );
            continue;
          }
        }

        console.log("🔍 Thumbnails Processing ID:", {
          original: typeof id,
          converted: stringId,
        });

        if (mongoose.Types.ObjectId.isValid(stringId)) {
          objectIds.push(new mongoose.Types.ObjectId(stringId));
        } else {
          console.warn("❌ Invalid ObjectId format in thumbnails:", stringId);
        }
      } catch (error) {
        console.warn(
          "❌ Error converting to ObjectId in thumbnails:",
          id,
          error.message
        );
      }
    }

    console.log("🔍 Converted objectIds:", objectIds);

    // Get feed posts directly (since postLabelIds are actually feed post IDs)
    const feedPosts = await getAll({
      col: "feeds",
      data: {
        _id: { $in: objectIds },
      },
      populate: [
        {
          path: "files",
          select: "fileUrl fileType",
        },
      ],
      limit: 3, // Only get the last 3 for thumbnails
      sort: { createdAt: -1 },
    });

    if (!Array.isArray(feedPosts) || feedPosts.length === 0) {
      return [];
    }

    // Extract thumbnail URLs from the feed posts
    const thumbnails = [];

    for (const feedPost of feedPosts) {
      if (feedPost.files && Array.isArray(feedPost.files)) {
        // Get the first image file as thumbnail
        const imageFile = feedPost.files.find(
          (file) => file.fileType === "image" && file.fileUrl
        );

        if (imageFile && thumbnails.length < 3) {
          thumbnails.push(imageFile.fileUrl);
        }
      }
    }

    console.log(
      "✅ getLastPostLabelThumbnails - Found thumbnails:",
      thumbnails.length
    );

    return thumbnails;
  } catch (error) {
    console.error("❌ Error fetching last post label thumbnails:", error);
    return [];
  }
}
