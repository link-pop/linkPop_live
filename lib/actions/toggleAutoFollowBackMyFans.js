"use server";

import { ObjectId } from "mongodb";
import { update } from "./crud";
import getMongoUser from "../utils/mongo/getMongoUser";

export async function toggleAutoFollowBackMyFans(formData) {
  const { mongoUser } = await getMongoUser();
  const isEnabled = formData.get("isEnabled") === "true";

  try {
    await update({
      col: "users",
      data: { _id: new ObjectId(mongoUser._id) },
      update: { autoFollowBackMyFans: isEnabled },
      revalidate: "/my/settings/fans"
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to toggle auto follow back my fans:", error);
    return { success: false, error: error.message };
  }
}
