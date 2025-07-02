"use server";

import { connectToDb } from "@/lib/db/connectToDb";
import { models } from "@/lib/db/models/models";
import { CLOUDINARY_DELETION_ENABLED } from "@/lib/utils/constants";
import {
  getAll,
  removeAll as removeAllFromCollection,
} from "@/lib/actions/crud";
import {
  deleteFromCloudinary,
  extractPublicIdsFromFiles,
} from "./deleteFromCloudinary";

/**
 * Deletes files associated with a post from both database and Cloudinary
 * @param {Object} post - The post object being deleted
 * @param {Object} col - Collection information
 * @returns {Object} - Result object with deletion information
 */
export async function deletePostFiles(post, col) {
  if (!post || !col) {
    return { success: false, error: "Post and collection are required" };
  }

  if (!CLOUDINARY_DELETION_ENABLED) {
    return {
      success: true,
      message: "Cloudinary deletion is disabled",
      totalDeleted: 0,
    };
  }

  const colName = typeof col === "string" ? col : col.name;
  const results = {
    attachments: { deleted: 0, errors: [] },
    directFiles: { deleted: 0, errors: [] },
    imageFields: { deleted: 0, errors: [] },
    cloudinary: { deleted: 0, errors: [] },
  };

  try {
    console.log(`🗑️ Starting file deletion for ${colName} post ${post._id}`);

    // 1. Handle collections that use separate attachment model (files field with ObjectIds)
    if (hasAttachmentFiles(colName, post)) {
      console.log(`📎 Deleting attachment files for ${colName}`);
      const attachmentResult = await deleteAttachmentFiles(post, colName);
      results.attachments = attachmentResult;
    }

    // 2. Handle collections with direct file arrays (files field with direct file objects)
    if (hasDirectFiles(colName, post)) {
      console.log(`📁 Deleting direct files for ${colName}`);
      const directFilesResult = await deleteDirectFiles(post);
      results.directFiles = directFilesResult;
    }

    // 3. Handle image fields (profileImage, coverImage, originalProfileImage, originalCoverImage)
    if (hasImageFields(colName, post)) {
      console.log(`🖼️ Deleting image fields for ${colName}`);
      const imageFieldsResult = await deleteImageFields(post);
      results.imageFields = imageFieldsResult;
    }

    const totalDeleted =
      results.attachments.deleted +
      results.directFiles.deleted +
      results.imageFields.deleted;

    console.log(
      `✅ Completed file deletion for ${colName} post ${post._id}. Total files deleted: ${totalDeleted}`
    );

    return {
      success: true,
      message: `Deleted ${totalDeleted} files for ${colName} post`,
      results,
      totalDeleted,
    };
  } catch (error) {
    console.error("❌ Error in deletePostFiles:", error);
    return {
      success: false,
      error: error.message,
      results,
    };
  }
}

/**
 * Checks if collection uses attachment model for files
 */
function hasAttachmentFiles(colName, post) {
  // Only feeds and storeitems use ObjectId references to attachments
  const attachmentCollections = ["feeds", "storeitems"];
  return (
    attachmentCollections.includes(colName) &&
    post.files &&
    Array.isArray(post.files) &&
    post.files.length > 0
  );
}

/**
 * Checks if collection has direct file arrays
 */
function hasDirectFiles(colName, post) {
  // chatmessages stores file data directly in the files array
  const directFileCollections = ["chatmessages", "features"];
  return (
    directFileCollections.includes(colName) &&
    post.files &&
    Array.isArray(post.files) &&
    post.files.length > 0
  );
}

/**
 * Checks if collection has image fields
 */
function hasImageFields(colName, post) {
  const imageFieldCollections = ["users", "landingpages"];
  return (
    imageFieldCollections.includes(colName) &&
    (post.profileImage ||
      post.coverImage ||
      post.originalProfileImage ||
      post.originalCoverImage)
  );
}

/**
 * Deletes attachment files (files stored in separate attachments collection)
 */
async function deleteAttachmentFiles(post, colName) {
  const result = { deleted: 0, errors: [] };

  try {
    if (!post.files || !Array.isArray(post.files)) {
      return result;
    }

    // Get all attachments for this post
    await connectToDb();
    const AttachmentModel = models.attachments;

    if (!AttachmentModel) {
      result.errors.push("Attachment model not found");
      return result;
    }

    console.log(`🔍 Looking for attachments with relatedPostId: ${post._id}`);
    const attachments = await AttachmentModel.find({
      relatedPostId: post._id,
    }).lean();

    console.log(
      `📎 Found ${attachments.length} attachments for post ${post._id}`
    );

    if (!attachments || attachments.length === 0) {
      console.log(
        `⚠️ No attachments found for post ${post._id}, but post has files array:`,
        post.files
      );
      return result;
    }

    // Extract file IDs and URLs for Cloudinary deletion
    const fileIds = [];
    const imageIds = [];
    const videoIds = [];

    for (const attachment of attachments) {
      if (attachment.fileId) {
        if (attachment.fileType === "video") {
          videoIds.push(attachment.fileId);
        } else {
          imageIds.push(attachment.fileId);
        }
        fileIds.push(attachment.fileId);
      }

      // Also handle originalFileId for cropped images
      if (attachment.originalFileId && attachment.isCropped) {
        imageIds.push(attachment.originalFileId);
        fileIds.push(attachment.originalFileId);
      }
    }

    // Delete from Cloudinary with invalidate=true to clear CDN cache
    if (imageIds.length > 0) {
      console.log(`🖼️ Deleting ${imageIds.length} images from Cloudinary`);
      const imageDeleteResult = await deleteFromCloudinary(
        imageIds,
        "image",
        true
      );
      result.deleted += imageDeleteResult.successCount || 0;
      if (imageDeleteResult.failureCount > 0) {
        result.errors.push(
          `Failed to delete ${imageDeleteResult.failureCount} images from Cloudinary`
        );
      }
    }

    if (videoIds.length > 0) {
      console.log(`🎥 Deleting ${videoIds.length} videos from Cloudinary`);
      const videoDeleteResult = await deleteFromCloudinary(
        videoIds,
        "video",
        true
      );
      result.deleted += videoDeleteResult.successCount || 0;
      if (videoDeleteResult.failureCount > 0) {
        result.errors.push(
          `Failed to delete ${videoDeleteResult.failureCount} videos from Cloudinary`
        );
      }
    }

    // Delete attachment records from database
    for (const attachment of attachments) {
      try {
        await AttachmentModel.findByIdAndDelete(attachment._id);
      } catch (error) {
        console.error("❌ Error deleting attachment from database:", error);
        result.errors.push(
          `Failed to delete attachment ${attachment._id} from database`
        );
      }
    }

    console.log(
      `✅ Deleted ${result.deleted} attachment files for ${colName} post ${post._id}`
    );
  } catch (error) {
    console.error("❌ Error in deleteAttachmentFiles:", error);
    result.errors.push(error.message);
  }

  return result;
}

/**
 * Deletes direct files (files stored directly in the post)
 */
async function deleteDirectFiles(post) {
  const result = { deleted: 0, errors: [] };

  try {
    if (!post.files || !Array.isArray(post.files)) {
      return result;
    }

    console.log(`📁 Processing ${post.files.length} direct files:`, post.files);

    // Extract public IDs from file URLs/objects - handle different structures
    const publicIds = await extractPublicIdsFromFiles(post.files);

    if (publicIds.length === 0) {
      console.log(
        `⚠️ No valid public IDs found in direct files for post ${post._id}`
      );
      return result;
    }

    console.log(`🔍 Extracted ${publicIds.length} public IDs:`, publicIds);

    // Separate images and videos based on file type if available
    const imageIds = [];
    const videoIds = [];

    // Try to determine file types from the original files array
    for (let i = 0; i < post.files.length; i++) {
      const file = post.files[i];
      const publicId = publicIds[i];

      if (!publicId) continue;

      // Check if file has type information
      if (file && typeof file === "object" && file.fileType) {
        if (file.fileType === "video") {
          videoIds.push(publicId);
        } else {
          imageIds.push(publicId);
        }
      } else {
        // Default to image if no type specified
        imageIds.push(publicId);
      }
    }

    // Delete images from Cloudinary
    if (imageIds.length > 0) {
      console.log(`📁 Deleting ${imageIds.length} image files from Cloudinary`);
      const imageDeleteResult = await deleteFromCloudinary(
        imageIds,
        "image",
        true
      );
      result.deleted += imageDeleteResult.successCount || 0;

      if (imageDeleteResult.failureCount > 0) {
        result.errors.push(
          `Failed to delete ${imageDeleteResult.failureCount} image files from Cloudinary`
        );
      }
    }

    // Delete videos from Cloudinary
    if (videoIds.length > 0) {
      console.log(`📁 Deleting ${videoIds.length} video files from Cloudinary`);
      const videoDeleteResult = await deleteFromCloudinary(
        videoIds,
        "video",
        true
      );
      result.deleted += videoDeleteResult.successCount || 0;

      if (videoDeleteResult.failureCount > 0) {
        result.errors.push(
          `Failed to delete ${videoDeleteResult.failureCount} video files from Cloudinary`
        );
      }
    }

    console.log(
      `✅ Deleted ${result.deleted} direct files for post ${post._id}`
    );
  } catch (error) {
    console.error("❌ Error in deleteDirectFiles:", error);
    result.errors.push(error.message);
  }

  return result;
}

/**
 * Deletes image fields (profileImage, coverImage, etc.)
 */
async function deleteImageFields(post) {
  const result = { deleted: 0, errors: [] };

  try {
    const imageFields = [
      "profileImage",
      "coverImage",
      "originalProfileImage",
      "originalCoverImage",
    ];
    const imageUrls = [];

    // Collect all image URLs
    for (const field of imageFields) {
      if (post[field] && typeof post[field] === "string") {
        imageUrls.push(post[field]);
      }
    }

    if (imageUrls.length === 0) {
      return result;
    }

    // Extract public IDs from URLs
    const publicIds = await extractPublicIdsFromFiles(imageUrls);

    if (publicIds.length === 0) {
      return result;
    }

    // Delete from Cloudinary with invalidate=true to clear CDN cache
    console.log(
      `🖼️ Deleting ${publicIds.length} image field files from Cloudinary`
    );
    const deleteResult = await deleteFromCloudinary(publicIds, "image", true);
    result.deleted = deleteResult.successCount || 0;

    if (deleteResult.failureCount > 0) {
      result.errors.push(
        `Failed to delete ${deleteResult.failureCount} image fields from Cloudinary`
      );
    }

    console.log(
      `✅ Deleted ${result.deleted} image field files for post ${post._id}`
    );
  } catch (error) {
    console.error("❌ Error in deleteImageFields:", error);
    result.errors.push(error.message);
  }

  return result;
}
