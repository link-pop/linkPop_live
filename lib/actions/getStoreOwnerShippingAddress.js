"use server";

import { getOne } from "./crud";

export const getStoreOwnerShippingAddress = async ({ storeOwnerId }) => {
  try {
    if (!storeOwnerId) {
      return { error: "Store owner ID is required" };
    }

    console.log("Getting store owner shipping address for:", storeOwnerId);

    // Get store owner's profile with shipping address
    const storeOwner = await getOne({
      col: "users",
      data: { _id: storeOwnerId },
      select: "storeShippingAddress name email",
    });

    if (!storeOwner) {
      return { error: "Store owner not found" };
    }

    // Check if store owner has configured shipping address
    if (!storeOwner.storeShippingAddress) {
      console.log("❌ Store owner has not configured shipping address");
      return {
        error: "Store owner has not configured shipping address",
        needsConfiguration: true,
      };
    }

    const shippingAddress = storeOwner.storeShippingAddress;

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
        console.log(`❌ Missing required shipping address field: ${field}`);
        return {
          error: `Store owner's shipping address is missing required field: ${field}`,
          needsConfiguration: true,
        };
      }
    }

    console.log("✅ Store owner shipping address found and valid");
    return {
      success: true,
      shippingAddress: {
        name: shippingAddress.name.trim(),
        line1: shippingAddress.line1.trim(),
        line2: shippingAddress.line2?.trim() || "",
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        postal_code: shippingAddress.postal_code.trim(),
        country: shippingAddress.country.trim(),
      },
    };
  } catch (error) {
    console.error("❌ Error in getStoreOwnerShippingAddress:", error);
    return {
      error: error.message || "Failed to get store owner shipping address",
    };
  }
};
