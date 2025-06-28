"use server";

import { update, getOne } from "./crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";

export const dynamic = "force-dynamic";

// Save user shipping address
export const saveUserShippingAddress = async (shippingAddress) => {
  try {
    const { mongoUser } = await getMongoUser();
    if (!mongoUser?._id) {
      return { error: "User not authenticated" };
    }

    // Validate required fields
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

    // Update user with shipping address
    const result = await update({
      col: "users",
      data: { _id: mongoUser._id },
      update: {
        userShippingAddress: {
          ...shippingAddress,
          updatedAt: new Date(),
        },
      },
    });

    if (result.error) {
      return { error: result.error };
    }

    return {
      success: true,
      shippingAddress: result.userShippingAddress,
    };
  } catch (error) {
    console.error("❌ Error saving user shipping address:", error);
    return { error: error.message || "Failed to save shipping address" };
  }
};

// Get user shipping address
export const getUserShippingAddress = async () => {
  try {
    const { mongoUser } = await getMongoUser();
    if (!mongoUser?._id) {
      return { error: "User not authenticated" };
    }

    const user = await getOne({
      col: "users",
      data: { _id: mongoUser._id },
    });

    if (!user) {
      return { error: "User not found" };
    }

    if (!user.userShippingAddress) {
      return {
        success: true,
        shippingAddress: null,
        hasAddress: false,
      };
    }

    return {
      success: true,
      shippingAddress: user.userShippingAddress,
      hasAddress: true,
    };
  } catch (error) {
    console.error("❌ Error getting user shipping address:", error);
    return { error: error.message || "Failed to get shipping address" };
  }
};
