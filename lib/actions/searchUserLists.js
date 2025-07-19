"use server";

import { connectToDb } from "../db/connectToDb";
import { handleError } from "../utils/errorHandling";
import { deepSanitize } from "../utils/mongo/sanitizeMongo";
import UserList from "../db/models/UserListsModel";
import mongoose from "mongoose";
import getMongoUser from "../utils/mongo/getMongoUser";

export async function searchUserLists(searchQuery) {
  try {
    await connectToDb();

    const { mongoUser } = await getMongoUser();
    if (!mongoUser?._id) {
      console.log("❌ ERROR: User not found");
      return { error: "User not found" };
    }

    if (!searchQuery || typeof searchQuery !== "string") {
      return { data: [] };
    }

    // Search user lists by name only
    const searchRegex = new RegExp(searchQuery.trim(), "i");

    const userLists = await UserList.find({
      createdBy: new mongoose.Types.ObjectId(mongoUser._id),
      name: { $regex: searchRegex },
      active: true, // Only active lists
    })
      .select(
        "_id name description slug targetCollection color icon sortOrder lastAttachmentUrls attachmentIds"
      )
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    // Add attachment count to each list
    const listsWithCounts = userLists.map((list) => ({
      ...list,
      attachmentCount: (list.attachmentIds || []).length,
      lastAttachmentUrls: list.lastAttachmentUrls || [],
    }));

    const sanitizedLists = deepSanitize(listsWithCounts);

    return { data: sanitizedLists };
  } catch (error) {
    console.error("❌ Error searching user lists:", error);
    return handleError(error, "searchUserLists");
  }
}
