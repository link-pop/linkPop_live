"use server";

import { getAll } from "./crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import mongoose from "mongoose";

export async function getSubscribers() {
  try {
    const { mongoUser } = await getMongoUser();

    if (!mongoUser?._id) {
      return [];
    }

    // Get all subscriptions where the current user is being subscribed to (subscribedTo)
    const subscribers = await getAll({
      col: "subscriptions",
      data: {
        subscribedTo: new mongoose.Types.ObjectId(mongoUser._id),
        active: true,
      },
      populate: [
        {
          path: "createdBy",
          select:
            "name username displayName bio profileImage imageUrl avatar _id age location subscriptionPrice",
        },
      ], // Populate the user who subscribed with specific fields
      sort: { createdAt: -1 },
    });

    console.log(
      "🔍 getSubscribers - Raw result:",
      subscribers?.length || 0,
      "subscribers"
    );
    if (subscribers && subscribers.length > 0) {
      console.log(
        "🔍 getSubscribers - First subscriber structure:",
        JSON.stringify(subscribers[0], null, 2)
      );
      console.log(
        "🔍 getSubscribers - First subscriber createdBy type:",
        typeof subscribers[0].createdBy
      );
      console.log(
        "🔍 getSubscribers - First subscriber createdBy value:",
        subscribers[0].createdBy
      );
    }

    return Array.isArray(subscribers) ? subscribers : [];
  } catch (error) {
    console.error("❌ Error fetching subscribers:", error);
    return [];
  }
}
