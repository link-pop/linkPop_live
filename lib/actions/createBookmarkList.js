"use server";

import { add } from "./crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";

export async function createBookmarkList(
  name,
  description = "",
  color = "#3b82f6",
  icon = "bookmark"
) {
  try {
    const { mongoUser } = await getMongoUser();

    if (!mongoUser?._id) {
      return { error: "User not authenticated" };
    }

    if (!name || name.trim().length === 0) {
      return { error: "List name is required" };
    }

    // Create URL-friendly slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    if (slug.length === 0) {
      return { error: "Invalid list name" };
    }

    const listData = {
      createdBy: mongoUser._id,
      name: name.trim(),
      description: description.trim(),
      slug,
      targetCollection: "bookmarks",
      active: true,
      color,
      icon,
      isSystemList: false,
      isPrivate: true,
      bookmarkIds: [],
      lastBookmarkThumbnails: [],
      sortOrder: 0,
    };

    const result = await add({
      col: "userlists",
      data: listData,
    });

    if (result.error) {
      return { error: result.error };
    }

    return { success: true, list: result };
  } catch (error) {
    console.error("❌ Error creating bookmark list:", error);
    return { error: "Failed to create bookmark list" };
  }
}
