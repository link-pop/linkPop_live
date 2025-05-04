"use server";

import { ObjectId } from "mongodb";
import { update } from "./crud";
import getMongoUser from "../utils/mongo/getMongoUser";

export async function toggleShowMediaCount(formData) {
  const { mongoUser } = await getMongoUser();
  const isEnabled = formData.get("isEnabled") === "true";

  try {
    await update({
      col: "users",
      data: { _id: new ObjectId(mongoUser._id) },
      update: { showMediaCount: isEnabled },
      revalidate: "/my/settings/security"
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to toggle show media count:", error);
    return { success: false, error: error.message };
  }
}
