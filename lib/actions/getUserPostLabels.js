"use server";

import { getAll } from "./crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import mongoose from "mongoose";

export async function getUserPostLabels() {
  try {
    const { mongoUser } = await getMongoUser();

    if (!mongoUser?._id) {
      return [];
    }

    const postLabels = await getAll({
      col: "postlabels",
      data: {
        userId: new mongoose.Types.ObjectId(mongoUser._id),
      },
      populate: {
        path: "postId",
        populate: {
          path: "files",
          model: "attachments",
        },
      },
      sort: { createdAt: -1 },
    });

    return Array.isArray(postLabels) ? postLabels : [];
  } catch (error) {
    console.error("❌ Error fetching user post labels:", error);
    return [];
  }
}
