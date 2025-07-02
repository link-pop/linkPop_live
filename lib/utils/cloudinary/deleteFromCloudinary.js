"use server";

import axios from "axios";

/**
 * Deletes files from Cloudinary using public IDs
 * @param {Array} fileIds - Array of Cloudinary public IDs to delete
 * @param {string} resourceType - Type of resource ('image' or 'video')
 * @param {boolean} invalidate - Whether to invalidate CDN cache immediately
 * @returns {Object} - Result object with success/error information
 */
export async function deleteFromCloudinary(
  fileIds,
  resourceType = "image",
  invalidate = true
) {
  if (!fileIds || fileIds.length === 0) {
    return { success: true, message: "No files to delete" };
  }

  try {
    const results = [];
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      console.error("❌ Cloudinary credentials not found");
      console.error("🔧 Missing environment variables:");
      if (!cloudName) console.error("   - NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME");
      if (!apiKey) console.error("   - CLOUDINARY_API_KEY");
      if (!apiSecret) console.error("   - CLOUDINARY_API_SECRET");
      console.error("📖 Please add these to your .env.local file:");
      console.error("   CLOUDINARY_API_KEY=your_api_key_here");
      console.error("   CLOUDINARY_API_SECRET=your_api_secret_here");
      console.error(
        "   Get them from: https://console.cloudinary.com/console/settings/security"
      );

      return {
        success: false,
        error:
          "Cloudinary API credentials not configured. Add CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to .env.local",
        missingCredentials: {
          cloudName: !cloudName,
          apiKey: !apiKey,
          apiSecret: !apiSecret,
        },
      };
    }

    console.log(
      `🗑️ Attempting to delete ${fileIds.length} ${resourceType} files from Cloudinary`
    );

    // Delete files one by one (Cloudinary doesn't support bulk delete in their free tier reliably)
    for (const fileId of fileIds) {
      if (!fileId) continue;

      try {
        const response = await axios.delete(
          `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`,
          {
            data: {
              public_id: fileId,
              invalidate: invalidate, // Clear CDN cache immediately
            },
            auth: {
              username: apiKey,
              password: apiSecret,
            },
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const isSuccess =
          response.data.result === "ok" || response.data.result === "not found";
        results.push({
          fileId,
          success: isSuccess,
          result: response.data.result,
        });

        if (isSuccess) {
          console.log(
            `✅ Deleted file from Cloudinary: ${fileId} (${response.data.result})`
          );
        } else {
          console.warn(
            `⚠️ Unexpected result for file ${fileId}: ${response.data.result}`
          );
        }
      } catch (error) {
        console.error(
          `❌ Failed to delete file from Cloudinary: ${fileId}`,
          error.response?.data || error.message
        );
        results.push({
          fileId,
          success: false,
          error: error.response?.data || error.message,
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    console.log(
      `🏁 Cloudinary deletion complete: ${successCount}/${fileIds.length} files deleted successfully`
    );

    return {
      success: failureCount === 0,
      message: `Deleted ${successCount}/${fileIds.length} files from Cloudinary`,
      results,
      successCount,
      failureCount,
    };
  } catch (error) {
    console.error("❌ Error in deleteFromCloudinary:", error);
    return {
      success: false,
      error: error.message,
      results: [],
    };
  }
}

/**
 * Extracts public IDs from file URLs or file objects
 * @param {Array} files - Array of file URLs, file objects, or mixed
 * @returns {Array} - Array of extracted public IDs
 */
export async function extractPublicIdsFromFiles(files) {
  if (!files || !Array.isArray(files)) return [];

  const results = await Promise.all(
    files.map(async (file) => {
      // If it's a string (file URL)
      if (typeof file === "string") {
        return await extractPublicIdFromUrl(file);
      }

      // If it's an object with fileId property
      if (file?.fileId) {
        return file.fileId;
      }

      // If it's an object with fileUrl property
      if (file?.fileUrl) {
        return await extractPublicIdFromUrl(file.fileUrl);
      }

      // If it's an object with a url property
      if (file?.url) {
        return await extractPublicIdFromUrl(file.url);
      }

      // Handle MongoDB ObjectId references (for attachment collections)
      if (typeof file === "string" && file.length === 24) {
        // This might be an ObjectId, skip it for direct extraction
        console.log(`⚠️ Skipping potential ObjectId: ${file}`);
        return null;
      }

      // Log unexpected file structure for debugging
      console.log(`⚠️ Unexpected file structure:`, file);
      return null;
    })
  );

  return results.filter(Boolean); // Remove null/undefined values
}

/**
 * Extracts public ID from Cloudinary URL
 * @param {string} url - Cloudinary file URL
 * @returns {string|null} - Extracted public ID or null
 */
export async function extractPublicIdFromUrl(url) {
  if (!url || typeof url !== "string") return null;

  try {
    // Cloudinary URLs have this pattern:
    // https://res.cloudinary.com/cloud_name/image/upload/v1234567890/public_id.extension
    // or https://res.cloudinary.com/cloud_name/image/upload/transformations/public_id.extension

    const urlParts = url.split("/");
    const uploadIndex = urlParts.indexOf("upload");

    if (uploadIndex === -1) return null;

    // Get the part after 'upload'
    let pathAfterUpload = urlParts.slice(uploadIndex + 1).join("/");

    // Remove version if present (starts with v followed by numbers)
    pathAfterUpload = pathAfterUpload.replace(/^v\d+\//, "");

    // Remove file extension
    const publicId = pathAfterUpload.replace(/\.[^/.]+$/, "");

    return publicId || null;
  } catch (error) {
    console.error("❌ Error extracting public ID from URL:", url, error);
    return null;
  }
}
