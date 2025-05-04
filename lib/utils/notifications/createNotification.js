/**
 * Utility function to create a notification
 * This function can be used from client components to create notifications
 */

import { add } from "@/lib/actions/crud";
import SOCKET_EVENTS from "@/chatServer/constants/socketEvents";

export async function createNotification({
  userId,
  type,
  title,
  content,
  sourceId,
  sourceModel,
  sourceUserId,
  link,
  socket = null, // Accept socket as an optional parameter
}) {
  try {
    // Create the notification object
    const notificationData = {
      userId,
      type,
      title,
      content,
      sourceId,
      sourceModel,
      sourceUserId,
      link,
    };
    
    // If we have a socket connection, emit the new notification event
    if (socket) {
      // Emit a new notification event
      socket.emit(SOCKET_EVENTS.NOTIFICATION.NEW, notificationData);
      return true;
    } else {
      // Fallback to regular API if socket is not available
      const notification = await add({
        col: "notifications",
        data: notificationData,
      });
      return notification;
    }
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
}
