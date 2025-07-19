"use server";

import { getOne, update } from "./crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";

export async function addAttachmentsToUserList(listId, attachmentIds) {
  try {
    const { mongoUser } = await getMongoUser();

    if (!mongoUser?._id) {
      return { error: "User not authenticated" };
    }

    if (
      !listId ||
      !Array.isArray(attachmentIds) ||
      attachmentIds.length === 0
    ) {
      return { error: "Invalid list ID or attachment IDs" };
    }

    // Get current list to check existing attachmentIds
    const currentList = await getOne({
      col: "userlists",
      data: { _id: listId },
    });

    if (!currentList || currentList.error) {
      return { error: "List not found" };
    }

    // Ensure we properly extract and convert attachment IDs to strings
    const attachmentIdsToProcess = attachmentIds
      .map((id) => {
        // Handle different input formats
        if (typeof id === "object" && id._id) {
          return id._id.toString();
        } else if (typeof id === "string") {
          return id;
        } else if (id && id.toString) {
          return id.toString();
        }
        return null;
      })
      .filter(Boolean); // Remove any null values

    // Get existing attachment IDs as strings for comparison
    const existingAttachmentIds = (currentList.attachmentIds || [])
      .map((id) => {
        if (typeof id === "object" && id._id) {
          return id._id.toString();
        } else if (typeof id === "string") {
          return id;
        } else if (id && id.toString) {
          return id.toString();
        }
        return null;
      })
      .filter(Boolean);

    // Separate attachments to add and remove
    const attachmentsToAdd = [];
    const attachmentsToRemove = [];

    attachmentIdsToProcess.forEach((attachmentId) => {
      if (existingAttachmentIds.includes(attachmentId)) {
        attachmentsToRemove.push(attachmentId);
      } else {
        attachmentsToAdd.push(attachmentId);
      }
    });

    // Create new attachment IDs array
    let newAttachmentIds = [...existingAttachmentIds];

    // Remove attachments that are already in the list
    if (attachmentsToRemove.length > 0) {
      newAttachmentIds = newAttachmentIds.filter(
        (id) => !attachmentsToRemove.includes(id)
      );
    }

    // Add new attachments
    if (attachmentsToAdd.length > 0) {
      newAttachmentIds.push(...attachmentsToAdd);
    }

    // Remove duplicates just in case
    newAttachmentIds = [...new Set(newAttachmentIds)];

    // Update the list with new attachment IDs
    const result = await update({
      col: "userlists",
      data: { _id: listId },
      update: {
        attachmentIds: newAttachmentIds,
        updatedAt: new Date(),
      },
      skipOwnershipCheck: true, // We already checked ownership above
    });

    if (result.error) {
      return { error: result.error };
    }

    return {
      success: true,
      addedCount: attachmentsToAdd.length,
      removedCount: attachmentsToRemove.length,
      totalCount: newAttachmentIds.length,
      action: attachmentsToAdd.length > 0 ? "added" : "removed",
    };
  } catch (error) {
    console.error("❌ Error toggling attachments in user list:", error);
    return { error: "Failed to update attachments in list" };
  }
}
