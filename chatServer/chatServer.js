// * chatServer.js
// * cd chatServer;npm run dev

const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "*", // TODO !!
    methods: ["GET", "POST"],
  },
});
const mongoose = require("mongoose");
require("dotenv").config();

// Import models
const ChatRoom = require("./models/ChatRoomModel");
const ChatMessage = require("./models/ChatMessageModel");
const Notification = require("./models/NotificationModel");
const Attachment = require("./models/AttachmentModel");
const startScheduledMessagesHandler = require("./handlers/scheduledMessages");
const sendNotificationCounts = require("./handlers/sendNotificationCounts");
const {
  updateChatRoomUnreadCounts,
  resetChatRoomUnreadCount,
} = require("./handlers/updateChatRoomUnreadCounts");
const sendChatRoomUnreadCounts = require("./handlers/sendChatRoomUnreadCounts");
const SOCKET_EVENTS = require("./constants/socketEvents");

const PORT = process.env.PORT || 3001;

// Connect to MongoDB with proper options
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    // Only start the server after successful MongoDB connection
    startServer();
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

function startServer() {
  // Store active users and their socket IDs
  const activeUsers = new Map();
  const userSocketMap = new Map(); // Maps userId to socketId

  // Start scheduled messages handler
  startScheduledMessagesHandler(io);

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Handle user joining
    socket.on(SOCKET_EVENTS.CHAT.USER.JOIN, async (userId) => {
      // Store the user as active
      activeUsers.set(socket.id, userId);

      // Map userId to socketId for easier lookups
      if (!userSocketMap.has(userId)) {
        userSocketMap.set(userId, new Set());
      }
      userSocketMap.get(userId).add(socket.id);

      // Broadcast the updated active users list
      const uniqueActiveUsers = [...new Set(activeUsers.values())];
      io.emit(SOCKET_EVENTS.CHAT.USER.LIST, uniqueActiveUsers);

      // Send chat room unread counts when user joins
      await sendChatRoomUnreadCounts(userId, io);
    });

    // Handle sending messages
    socket.on(
      SOCKET_EVENTS.CHAT.MESSAGE.SEND,
      async ({
        chatId,
        message,
        userId,
        files,
        expirationPeriod,
        scheduleAt,
        replyToMsgId,
        price,
      }) => {
        console.log("Received message:", {
          chatId,
          message,
          userId,
          files,
          replyToMsgId,
          price,
        });
        try {
          // * Find chat room
          let chatRoom = await ChatRoom.findOne({
            _id: chatId,
          });

          if (!chatRoom) {
            throw new Error("Chat room not found");
          }

          // Create message
          const chatMessage = await ChatMessage.create({
            chatRoomId: chatRoom._id,
            createdBy: userId,
            chatMsgText: message,
            chatMsgStatus: "delivered",
            files: files || [],
            expirationPeriod,
            scheduleAt,
            chatReplyToMsgId: replyToMsgId || null,
            // * rewrite createdAt if scheduleAt is provided, so the message shows up in the correct time
            createdAt: scheduleAt ? new Date(scheduleAt) : undefined,
            createdAtOriginal: new Date(),
            price: price > 0 ? price : null,
          });

          // Update attachments with relatedPostId and isPaid flag
          if (files && files.length > 0 && chatMessage._id) {
            // Get all attachment IDs from the files array
            const attachmentIds = files
              .filter((file) => file._id)
              .map((file) => file._id);

            if (attachmentIds.length > 0) {
              try {
                // Update all attachments with relatedPostId and isPaid flag
                await Attachment.updateMany(
                  { _id: { $in: attachmentIds } },
                  {
                    relatedPostId: chatMessage._id,
                    isPaid: price > 0 ? true : false,
                  }
                );
                console.log(
                  `Updated ${attachmentIds.length} attachments with relatedPostId and isPaid flag`
                );
              } catch (attachmentError) {
                console.error("Error updating attachments:", attachmentError);
              }
            }
          }

          // * Update chat room's last message only if not scheduled
          if (!scheduleAt) {
            await ChatRoom.findOneAndUpdate(
              { _id: chatRoom._id },
              { chatRoomLastMsg: chatMessage._id },
              { new: true }
            );
          }

          const messageObj = {
            _id: chatMessage._id,
            chatMsgText: message,
            createdBy: userId,
            chatMsgStatus: chatMessage.chatMsgStatus,
            files: chatMessage.files || [],
            expirationPeriod: chatMessage.expirationPeriod,
            scheduleAt: chatMessage.scheduleAt,
            createdAtOriginal: chatMessage.createdAtOriginal,
            chatReplyToMsgId: replyToMsgId,
            price: chatMessage.price,
          };

          console.log("Final message object being sent:", messageObj);

          // Broadcast message to all users in the chat
          io.emit(SOCKET_EVENTS.CHAT.MESSAGE.RECEIVED(chatId), messageObj);

          // Update unread counts for this chat room
          if (!scheduleAt) {
            await updateChatRoomUnreadCounts(chatId, userId);

            // Send updated unread counts to all users in the chat
            for (const chatRoomUser of chatRoom.chatRoomUsers) {
              if (chatRoomUser.toString() !== userId.toString()) {
                await sendChatRoomUnreadCounts(chatRoomUser, io);
              }
            }
          }

          // ! notifications 1
          // Create notification for all users in the chat except sender
          // Get all users in the chat room
          const chatRoomUsers = chatRoom.chatRoomUsers || [];

          // Create notifications for all users except the sender
          for (const chatRoomUser of chatRoomUsers) {
            if (chatRoomUser.toString() !== userId.toString()) {
              const notification = await Notification.create({
                userId: chatRoomUser,
                type: "message",
                title: "New Message",
                content:
                  message.length > 50
                    ? `${message.substring(0, 50)}...`
                    : message,
                sourceId: chatMessage._id,
                sourceModel: "chatmessages",
                sourceUserId: userId,
                link: `/chatrooms?chatId=${chatId}`,
              });

              // Emit notification to the user
              io.emit(
                SOCKET_EVENTS.NOTIFICATION.USER(chatRoomUser),
                notification
              );

              // Send updated notification counts (total and message-specific)
              await sendNotificationCounts(chatRoomUser, io);
            }
          }
        } catch (error) {
          console.error("Error saving message:", error);
          socket.emit(SOCKET_EVENTS.CHAT.MESSAGE.ERROR, {
            error: error.message,
          });
        }
      }
    );
    // ? notifications 1

    // Handle message deletion
    socket.on(
      SOCKET_EVENTS.CHAT.MESSAGE.DELETE,
      async ({ chatId, messageId }) => {
        try {
          // Broadcast message deletion to all users in the chat
          io.emit(SOCKET_EVENTS.CHAT.MESSAGE.DELETED(chatId), { messageId });
        } catch (error) {
          console.error("Error handling message deletion:", error);
          socket.emit(SOCKET_EVENTS.CHAT.MESSAGE.ERROR, {
            error: error.message,
          });
        }
      }
    );

    // Handle message hiding
    socket.on(
      SOCKET_EVENTS.CHAT.MESSAGE.HIDE,
      async ({ chatId, messageId }) => {
        try {
          // Broadcast message hiding to all users in the chat
          io.emit(SOCKET_EVENTS.CHAT.MESSAGE.HIDDEN(chatId), { messageId });
        } catch (error) {
          console.error("Error handling message hiding:", error);
          socket.emit(SOCKET_EVENTS.CHAT.MESSAGE.ERROR, {
            error: error.message,
          });
        }
      }
    );

    // Handle chat room view (reset unread count)
    socket.on(SOCKET_EVENTS.CHAT.ROOM.VIEW, async ({ chatId, userId }) => {
      try {
        // Reset unread count for this user in this chat room
        await resetChatRoomUnreadCount(chatId, userId);

        // Send updated unread counts to the user
        await sendChatRoomUnreadCounts(userId, io);
      } catch (error) {
        console.error("Error handling chat room view:", error);
      }
    });

    // Handle getting chat room unread counts
    socket.on(SOCKET_EVENTS.CHAT.ROOM.GET_UNREAD_COUNTS, async ({ userId }) => {
      try {
        await sendChatRoomUnreadCounts(userId, io);
      } catch (error) {
        console.error("Error getting chat room unread counts:", error);
      }
    });

    // ! notifications 2
    // Handle notification operations
    socket.on(SOCKET_EVENTS.NOTIFICATION.GET, async ({ userId }) => {
      try {
        const notifications = await Notification.find({ userId })
          .sort({ createdAt: -1 })
          .limit(50);
        socket.emit(SOCKET_EVENTS.NOTIFICATION.USER(userId), notifications);

        // Also send updated counts
        await sendNotificationCounts(userId, io);
      } catch (error) {
        console.error("Error getting notifications:", error);
      }
    });

    // Handle creating a new notification
    socket.on(SOCKET_EVENTS.NOTIFICATION.NEW, async (notificationData) => {
      try {
        // Create the notification in the database
        const notification = await Notification.create(notificationData);

        // Emit the notification to the target user
        io.emit(
          SOCKET_EVENTS.NOTIFICATION.USER(notification.userId),
          notification
        );

        // Send updated notification counts
        await sendNotificationCounts(notification.userId, io);
      } catch (error) {
        console.error("Error creating notification:", error);
      }
    });

    socket.on(SOCKET_EVENTS.NOTIFICATION.READ, async ({ notificationId }) => {
      try {
        const notification = await Notification.findByIdAndUpdate(
          notificationId,
          { read: true },
          { new: true }
        );
        if (notification) {
          const userId = notification.userId;

          // Send updated notification counts
          await sendNotificationCounts(userId, io);
        }
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    });

    socket.on(SOCKET_EVENTS.NOTIFICATION.READ_ALL, async ({ userId }) => {
      try {
        await Notification.updateMany({ userId, read: false }, { read: true });

        // Send updated notification counts (both will be zero)
        io.emit(SOCKET_EVENTS.NOTIFICATION.COUNT, {
          userId,
          count: 0,
          messageCount: 0,
        });
      } catch (error) {
        console.error("Error marking all notifications as read:", error);
      }
    });

    socket.on(SOCKET_EVENTS.NOTIFICATION.COUNT, async ({ userId }) => {
      try {
        await sendNotificationCounts(userId, io);
      } catch (error) {
        console.error("Error getting notification count:", error);
      }
    });
    // ? notifications 2

    // Handle user disconnection
    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);

      // Get the userId associated with this socket
      const userId = activeUsers.get(socket.id);

      if (userId) {
        // Remove this socket from the user's set of sockets
        if (userSocketMap.has(userId)) {
          userSocketMap.get(userId).delete(socket.id);

          // If user has no more active sockets, remove from userSocketMap
          if (userSocketMap.get(userId).size === 0) {
            userSocketMap.delete(userId);
          }
        }

        // Remove this socket from activeUsers
        activeUsers.delete(socket.id);

        // Broadcast updated active users list
        const uniqueActiveUsers = [...new Set(activeUsers.values())];
        io.emit(SOCKET_EVENTS.CHAT.USER.LIST, uniqueActiveUsers);
      }
    });
  });

  http.listen(PORT, () => {
    console.log(`Chat server running on port ${PORT}`);
  });
}
