"use server";

import { removeOne } from "./crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import { checkMessagePurchaseStatus } from "@/lib/utils/mongo/checkMessagePurchaseStatus";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

// * Server action to unsend (delete) mass messages
export const unsendMassMessage = async ({ messageIds }) => {
  try {
    const { mongoUser } = await getMongoUser();
    if (!mongoUser) {
      throw new Error("User not authenticated");
    }

    if (!messageIds || messageIds.length === 0) {
      throw new Error("No message IDs provided");
    }

    // Check which messages have been purchased
    console.log("🔍 Checking purchase status for messages:", messageIds.length);
    const purchaseStatusMap = await checkMessagePurchaseStatus(messageIds);

    // Filter out purchased messages
    const purchasedMessages = [];
    const deletableMessages = [];

    messageIds.forEach((messageId) => {
      if (purchaseStatusMap[messageId]) {
        purchasedMessages.push(messageId);
      } else {
        deletableMessages.push(messageId);
      }
    });

    console.log(
      `📊 Messages analysis: ${deletableMessages.length} deletable, ${purchasedMessages.length} purchased (protected)`
    );

    // Delete each deletable message individually (for ownership verification)
    let deletedCount = 0;
    const errors = [];

    for (const messageId of deletableMessages) {
      try {
        const result = await removeOne({
          col: "chatmessages",
          data: {
            _id: new mongoose.Types.ObjectId(messageId),
            createdBy: mongoUser._id, // Security: only delete own messages
          },
        });

        if (result && !result.error) {
          deletedCount++;
        } else {
          errors.push(
            `Failed to delete message ${messageId}: ${
              result?.error || "Unknown error"
            }`
          );
        }
      } catch (error) {
        errors.push(`Error deleting message ${messageId}: ${error.message}`);
      }
    }

    // Add warnings for purchased messages that couldn't be deleted
    if (purchasedMessages.length > 0) {
      errors.push(
        `${purchasedMessages.length} message(s) could not be deleted because they have been purchased by users`
      );
    }

    return {
      success: true,
      deletedCount,
      skippedPurchasedCount: purchasedMessages.length,
      totalRequested: messageIds.length,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    console.error("❌ Error unsending mass messages:", error);
    return {
      success: false,
      error: error.message,
      deletedCount: 0,
      skippedPurchasedCount: 0,
      totalRequested: messageIds?.length || 0,
    };
  }
};
