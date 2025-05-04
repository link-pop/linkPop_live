"use server";

import { update } from "@/lib/actions/crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";

export async function updateSubscriptionPrice(price) {
  try {
    const { mongoUser } = await getMongoUser();
    
    if (!mongoUser) {
      throw new Error("User not authenticated");
    }

    // Validate price
    const priceNumber = parseFloat(price);
    
    if (isNaN(priceNumber)) {
      throw new Error("Invalid price format");
    }
    
    if (priceNumber < 0) {
      throw new Error("Price cannot be negative");
    }

    // Round to 2 decimal places
    const roundedPrice = Math.round(priceNumber * 100) / 100;

    // Update user's subscription price
    await update({
      col: "users",
      data: { _id: mongoUser._id },
      update: { subscriptionPrice: roundedPrice },
    });

    return { success: true, price: roundedPrice };
  } catch (error) {
    console.error("Error updating subscription price:", error);
    return { success: false, error: error.message };
  }
}
