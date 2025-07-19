"use server";

import { add } from "./crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";

export async function createUserList({
  name,
  description = "",
  slug,
  targetCollection = "attachments",
  filterCriteria = {},
  color = "#3b82f6",
  icon = "folder",
}) {
  try {
    const { mongoUser } = await getMongoUser();

    if (!mongoUser) {
      return { error: "User not authenticated" };
    }

    // Validate required fields
    if (!name || !slug) {
      return { error: "Name and slug are required" };
    }

    // Create the user list
    const newList = await add({
      col: "userlists",
      data: {
        createdBy: mongoUser._id,
        name: name.trim(),
        description: description.trim(),
        slug: slug.toLowerCase().trim(),
        targetCollection,
        filterCriteria,
        color,
        icon,
        isSystemList: false,
        isPrivate: true,
        active: true,
        sortOrder: 0,
        attachmentIds: [], // Initialize with empty array
        lastAttachmentUrls: [], // Initialize with empty array for preview URLs
      },
    });

    if (!newList) {
      return { error: "Failed to create user list" };
    }

    const plainList = JSON.parse(JSON.stringify(newList));

    return { success: true, list: plainList };
  } catch (error) {
    console.error("❌ Error creating user list:", error);

    // Handle duplicate slug error
    if (error.code === 11000) {
      return { error: "A list with this name already exists" };
    }

    return { error: "Failed to create user list" };
  }
}
