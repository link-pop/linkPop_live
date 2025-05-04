const mongoose = require("mongoose");

const chatRoomSchema = new mongoose.Schema(
  {
    chatRoomUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
    ],
    chatRoomLastMsg: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "chatmessages",
    },
    // Track unread messages for each user in the chat room
    unreadCounts: {
      type: Map,
      of: Number,
      default: new Map(),
    },
  },
  { timestamps: true }
);

chatRoomSchema.settings = {
  noFullPost: true,
};

// Export both the model (for chatServer) and schema (for main app)
module.exports =
  mongoose.models?.chatrooms || mongoose.model("chatrooms", chatRoomSchema);
module.exports.chatRoomSchema = chatRoomSchema;
