"use server";

import { getAll } from "@/lib/actions/crud";
import mongoose from "mongoose";

/**
 * Get the last 3 attachment URLs from a list of attachment IDs
 * @param {Array} attachmentIds - Array of attachment IDs (most recent first)
 * @returns {Array} Array of up to 3 attachment URLs
 */
export async function getLastAttachmentUrls(attachmentIds) {
  if (
    !attachmentIds ||
    !Array.isArray(attachmentIds) ||
    attachmentIds.length === 0
  ) {
    return [];
  }

  try {
    // Take the last 3 attachment IDs (most recently added)
    const lastThreeIds = attachmentIds.slice(-3).reverse(); // reverse to get most recent first

    // Convert to ObjectIds
    const objectIds = lastThreeIds
      .filter((id) => id && typeof id === "string" && /^[a-f\d]{24}$/i.test(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    if (objectIds.length === 0) {
      return [];
    }

    // Get attachments with only the fileUrl field
    const attachments = await getAll({
      col: "attachments",
      data: {
        _id: { $in: objectIds },
      },
      select: "fileUrl", // Only select the fileUrl field for efficiency
    });

    if (!attachments || attachments.error) {
      return [];
    }

    // Extract URLs and maintain order
    const urls = [];
    for (const id of objectIds) {
      const attachment = attachments.find(
        (att) => att._id.toString() === id.toString()
      );
      if (attachment && attachment.fileUrl) {
        urls.push(attachment.fileUrl);
      }
    }

    return urls;
  } catch (error) {
    console.error("❌ Error getting last attachment URLs:", error);
    return [];
  }
}
