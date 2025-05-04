"use server";

import { ObjectId } from "mongodb";
import { update } from "./crud";
import getMongoUser from "../utils/mongo/getMongoUser";

export async function toggleShowProfileUrl(formData) {
  const { mongoUser } = await getMongoUser();
  const isEnabled = formData.get("isEnabled") === "true";

  try {
    await update({
      col: "users",
      data: { _id: new ObjectId(mongoUser._id) },
      update: { showProfileUrl: isEnabled },
      revalidate: "/my/settings/qrcode"
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to toggle show profile URL:", error);
    return { success: false, error: error.message };
  }
}
