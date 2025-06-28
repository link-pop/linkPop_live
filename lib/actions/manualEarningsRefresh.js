"use server";

import { calculateStoreEarnings } from "./storeEarningsActions";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";

export const dynamic = "force-dynamic";

export const manualEarningsRefresh = async () => {
  try {
    console.log("🔄 Manual earnings refresh triggered");

    const { mongoUser } = await getMongoUser();
    if (!mongoUser?._id) {
      return { error: "User not authenticated" };
    }

    console.log("👤 Refreshing earnings for user:", mongoUser._id);

    const result = await calculateStoreEarnings(mongoUser._id);

    if (result.error) {
      console.error("❌ Manual refresh failed:", result.error);
      return { error: result.error };
    }

    console.log("✅ Manual refresh successful:", result);
    return { success: true, data: result };
  } catch (error) {
    console.error("❌ Manual refresh exception:", error);
    return { error: error.message || "Failed to refresh earnings" };
  }
};
