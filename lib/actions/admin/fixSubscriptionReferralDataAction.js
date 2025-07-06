"use server";

import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import { fixSubscriptionReferralData } from "@/lib/utils/subscription/fixSubscriptionReferralData";
import { revalidatePath } from "next/cache";

/**
 * Admin action to fix missing referral data in subscriptions
 * This can be triggered manually from the admin panel
 */
export async function fixSubscriptionReferralDataAction() {
  try {
    // Check if user is admin
    const { mongoUser } = await getMongoUser();
    if (!mongoUser?.isAdmin) {
      return {
        success: false,
        error: "Unauthorized: Admin access required",
      };
    }

    console.log("🔧 Admin triggered referral data fix...");

    // Run the fix
    const result = await fixSubscriptionReferralData();

    // Revalidate the admin pages to show updated data
    revalidatePath("/pricing");
    revalidatePath("/admin");

    console.log("✅ Referral data fix completed by admin");

    return {
      success: true,
      message: `Fixed ${result.fixed} subscriptions, skipped ${result.skipped}`,
      details: result,
    };
  } catch (error) {
    console.error("❌ Error in admin referral data fix:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
