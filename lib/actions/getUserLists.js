"use server";

import { getAll } from "./crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";

export async function getUserLists() {
  try {
    const { mongoUser } = await getMongoUser();

    if (!mongoUser?._id) {
      return [];
    }

    const lists = await getAll({
      col: "userlists",
      data: {
        createdBy: mongoUser._id,
        active: true,
        targetCollection: "attachments", // Only show lists for attachments
      },
    });

    // Ensure we return a plain array, even if getAll returns an error
    if (!Array.isArray(lists)) {
      return [];
    }

    // Add attachment count to each list
    const listsWithCounts = lists.map((list) => ({
      ...list,
      attachmentCount: (list.attachmentIds || []).length,
    }));

    return listsWithCounts;
  } catch (error) {
    console.error("❌ Error fetching user lists:", error);
    return [];
  }
}
