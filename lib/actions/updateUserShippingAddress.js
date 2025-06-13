"use server";

import { update } from "./crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";

export const updateUserShippingAddress = async ({ shippingAddress }) => {
  try {
    const { mongoUser } = await getMongoUser();
    if (!mongoUser?._id) {
      return { error: "User not authenticated" };
    }

    if (!shippingAddress) {
      return { error: "Shipping address is required" };
    }

    // Validate shipping address
    const requiredFields = [
      "name",
      "line1",
      "city",
      "state",
      "postal_code",
      "country",
    ];
    for (const field of requiredFields) {
      if (!shippingAddress[field]?.trim()) {
        return { error: `Missing required field: ${field}` };
      }
    }

    console.log("Updating user store shipping address...");

    // Update user's store shipping address
    const result = await update({
      col: "users",
      data: { _id: mongoUser._id },
      update: {
        storeShippingAddress: {
          name: shippingAddress.name.trim(),
          line1: shippingAddress.line1.trim(),
          line2: shippingAddress.line2?.trim() || "",
          city: shippingAddress.city.trim(),
          state: shippingAddress.state.trim(),
          postal_code: shippingAddress.postal_code.trim(),
          country: shippingAddress.country.trim(),
          updatedAt: new Date(),
        },
      },
    });

    if (result.error) {
      console.error("❌ Error updating user shipping address:", result.error);
      return { error: result.error };
    }

    console.log("✅ User store shipping address updated successfully");
    return { success: true, user: result };
  } catch (error) {
    console.error("❌ Error in updateUserShippingAddress:", error);
    return { error: error.message || "Failed to update shipping address" };
  }
};
