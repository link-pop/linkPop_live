"use server";

import { generateReferralCode } from "@/lib/utils/generateReferralCode";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import { update } from "@/lib/actions/crud";
import { revalidatePath } from "next/cache";

/**
 * Generates a referral code for the current user if they don't already have one
 *
 * @returns {Promise<{success: boolean, referralCode: string|null, message: string}>}
 */
export async function generateUserReferralCode() {
  try {
    console.log("Starting generateUserReferralCode function");
    const { mongoUser } = await getMongoUser();

    if (!mongoUser) {
      console.log("No mongoUser found");
      return {
        success: false,
        referralCode: null,
        message: "User not authenticated",
      };
    }

    console.log("MongoDB user found:", mongoUser._id.toString());

    // If user already has a referral code, return it
    if (mongoUser.referralCode) {
      console.log("User already has referral code:", mongoUser.referralCode);
      return {
        success: true,
        referralCode: mongoUser.referralCode,
        message: "Existing referral code retrieved",
      };
    }

    console.log("Generating new referral code");
    // Generate a unique referral code
    const referralCode = generateReferralCode(
      mongoUser._id.toString(),
      mongoUser.name
    );
    console.log("Generated referral code:", referralCode);

    console.log("Updating user with new referral code");
    // Update the user with the new referral code
    const result = await update({
      col: "users",
      data: { _id: mongoUser._id },
      update: { referralCode },
      revalidate: "/profile",
    });

    console.log("Update result:", result);

    if (result && result.error) {
      console.error("Error updating user:", result.error);
      return {
        success: false,
        referralCode: null,
        message: `Error updating user: ${result.error}`,
      };
    }

    // Manually revalidate the affiliate page path to ensure it shows updated data
    try {
      revalidatePath("/affiliate");
      console.log("Revalidated /affiliate path");
    } catch (revalidateError) {
      console.error("Error revalidating path:", revalidateError);
    }

    return {
      success: true,
      referralCode,
      message: "Referral code generated successfully",
    };
  } catch (error) {
    console.error("Error generating referral code:", error);
    return {
      success: false,
      referralCode: null,
      message: `Error generating referral code: ${error.message}`,
    };
  }
}
