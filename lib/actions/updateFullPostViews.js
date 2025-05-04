"use server";

import { ObjectId } from "mongodb";
import { update } from "./crud";

export async function updateFullPostViews(col, postId) {
  if (!col || !postId) return;
  
  try {
    const res = await update({
      col,
      data: { _id: new ObjectId(postId) },
      update: { $inc: { views: 1 } },
    });
    return res;
  } catch (error) {
    console.error("Error updating post views:", error);
    throw error;
  }
}
