"use server";

import { getAll } from "./crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import mongoose from "mongoose";

export async function getSubscriptions() {
  try {
    const { mongoUser } = await getMongoUser();

    if (!mongoUser?._id) {
      return [];
    }

    // Get all subscriptions where the current user is the subscriber (createdBy)
    const subscriptions = await getAll({
      col: "subscriptions",
      data: {
        createdBy: new mongoose.Types.ObjectId(mongoUser._id),
        active: true,
      },
      populate: [
        {
          path: "subscribedTo",
          select:
            "name username displayName bio profileImage imageUrl avatar _id age location subscriptionPrice",
        },
      ], // Populate the user they subscribed to with specific fields
      sort: { createdAt: -1 },
    });

    // Debug logging to verify population worked
    if (subscriptions && subscriptions.length > 0) {
      console.log(
        "🔍 getSubscriptions - Total subscriptions:",
        subscriptions.length
      );
      console.log(
        "🔍 getSubscriptions - First subscription subscribedTo type:",
        typeof subscriptions[0].subscribedTo
      );
      console.log(
        "🔍 getSubscriptions - First subscription subscribedTo value:",
        subscriptions[0].subscribedTo
      );
    }

    return Array.isArray(subscriptions) ? subscriptions : [];
  } catch (error) {
    console.error("❌ Error fetching subscriptions:", error);
    return [];
  }
}
