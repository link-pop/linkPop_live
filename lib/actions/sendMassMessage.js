"use server";

import { add, getOne, update } from "./crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import { createMassMessageNotifications } from "@/lib/utils/notifications/createMassMessageNotifications";
import mongoose from "mongoose";

// * Server action to send mass messages to multiple users
export const sendMassMessage = async ({
  recipientIds,
  message,
  files = [],
  expirationPeriod = null,
  scheduleAt = null,
  price = null,
  senderId,
}) => {
  try {
    const { mongoUser } = await getMongoUser();
    if (!mongoUser || mongoUser._id.toString() !== senderId) {
      throw new Error("User not authenticated");
    }

    if (!recipientIds || recipientIds.length === 0) {
      throw new Error("No recipients specified");
    }

    // Allow messages with files only, but not completely empty messages
    if (!message.trim() && (!files || files.length === 0)) {
      throw new Error("Message cannot be empty");
    }

    const results = [];
    const errors = [];

    // Send message to each recipient
    for (const recipientId of recipientIds) {
      try {
        // Check if chatroom already exists between sender and recipient
        let chatroom = await getOne({
          col: "chatrooms",
          data: {
            chatRoomUsers: {
              $all: [
                new mongoose.Types.ObjectId(senderId),
                new mongoose.Types.ObjectId(recipientId),
              ],
            },
            $expr: { $eq: [{ $size: "$chatRoomUsers" }, 2] }, // Ensure it's a 1-on-1 chat
          },
        });

        // Create chatroom if it doesn't exist
        if (!chatroom) {
          chatroom = await add({
            col: { name: "chatrooms" },
            data: {
              chatRoomUsers: [
                new mongoose.Types.ObjectId(senderId),
                new mongoose.Types.ObjectId(recipientId),
              ],
              chatRoomName: "",
              chatRoomType: "direct",
            },
          });
        }

        if (!chatroom) {
          errors.push(`Failed to create/find chatroom for user ${recipientId}`);
          continue;
        }

        // Create the message
        const messageData = {
          chatRoomId: chatroom._id.toString(),
          createdBy: new mongoose.Types.ObjectId(senderId),
          chatMsgText: message || "", // Use empty string if no message text
          chatMsgStatus: "delivered",
          files: files || [],
          expirationPeriod,
          scheduleAt: scheduleAt ? new Date(scheduleAt) : null,
          price: price > 0 ? price : null,
        };

        const newMessage = await add({
          col: { name: "chatmessages" },
          data: messageData,
        });

        if (newMessage) {
          // Update chatroom's last message if not scheduled
          if (!scheduleAt) {
            await update({
              col: { name: "chatrooms" },
              data: { _id: chatroom._id },
              update: { chatRoomLastMsg: newMessage._id },
              skipOwnershipCheck: true,
            });
          }

          results.push({
            recipientId,
            chatroomId: chatroom._id,
            messageId: newMessage._id,
          });
        } else {
          errors.push(`Failed to create message for user ${recipientId}`);
        }
      } catch (error) {
        console.error(`❌ Error sending message to ${recipientId}:`, error);
        errors.push(`Error for user ${recipientId}: ${error.message}`);
      }
    }

    // Create notifications for successful messages (only for non-scheduled messages)
    if (results.length > 0 && !scheduleAt) {
      try {
        const notificationResult = await createMassMessageNotifications({
          messageResults: results,
          senderId,
          messageText: message,
          files,
        });

        console.log(
          `✅ Mass message notifications: ${notificationResult.count} created`
        );
      } catch (notificationError) {
        console.error(
          "❌ Error creating mass message notifications:",
          notificationError
        );
        // Don't fail the whole operation if notifications fail
      }
    }

    return {
      success: true,
      results,
      errors,
      totalSent: results.length,
      totalErrors: errors.length,
    };
  } catch (error) {
    console.error("❌ Error in sendMassMessage:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
