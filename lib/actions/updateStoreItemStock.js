"use server";

import { getOne, update } from "./crud";

// Update store item stock after purchase
export const updateStoreItemStock = async ({
  storeItemId,
  quantityPurchased,
}) => {
  try {
    if (!storeItemId || !quantityPurchased || quantityPurchased <= 0) {
      return { error: "Invalid parameters for stock update" };
    }

    // Get current store item
    const storeItem = await getOne({
      col: "storeitems",
      data: { _id: storeItemId },
    });

    if (!storeItem) {
      return { error: "Store item not found" };
    }

    // Calculate new stock
    const newStock = Math.max(0, storeItem.stock - quantityPurchased);

    // Update stock - Skip ownership check because this is a system operation
    // that should happen automatically after purchases regardless of current user
    const result = await update({
      col: "storeitems",
      data: { _id: storeItemId },
      update: { stock: newStock }, // Only updating stock field for security
      skipOwnershipCheck: true, // Allow system stock updates
    });

    if (result?.error) {
      return { error: result.error };
    }

    console.log(
      `Stock updated for item ${storeItemId}: ${storeItem.stock} -> ${newStock}`
    );

    return {
      success: true,
      previousStock: storeItem.stock,
      newStock: newStock,
      quantityPurchased: quantityPurchased,
    };
  } catch (error) {
    console.error("❌ Error updating store item stock:", error);
    return { error: error.message || "Failed to update stock" };
  }
};

// Batch update stock for multiple items (used in order processing)
export const updateMultipleStoreItemsStock = async (items) => {
  try {
    if (!Array.isArray(items) || items.length === 0) {
      return { error: "No items provided for stock update" };
    }

    const updateResults = [];
    const errors = [];

    for (const item of items) {
      const result = await updateStoreItemStock({
        storeItemId: item.storeItemId,
        quantityPurchased: item.quantity,
      });

      if (result.error) {
        errors.push({
          storeItemId: item.storeItemId,
          error: result.error,
        });
      } else {
        updateResults.push(result);
      }
    }

    if (errors.length > 0) {
      console.error("Some stock updates failed:", errors);
      return {
        error: "Some stock updates failed",
        details: errors,
        successfulUpdates: updateResults,
      };
    }

    return {
      success: true,
      updatedItems: updateResults.length,
      results: updateResults,
    };
  } catch (error) {
    console.error("Error in batch stock update:", error);
    return {
      error: error.message || "Failed to update stock for multiple items",
    };
  }
};
