const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
  {
    chatRoomId: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    chatMsgText: {
      type: String,
      required: true,
    },
    chatMsgStatus: {
      type: String,
      enum: ["failed", "delivered", "read"],
      default: "delivered",
    },
    files: {
      type: Array,
      default: [],
    },
    chatReplyToMsgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "chatmessages",
      default: null,
    },
    createdAtOriginal: {
      type: Date,
      default: Date.now,
    },
    likes: {
      type: Number,
      default: 0,
      required: false,
    },
    expirationPeriod: {
      type: String,
      default: null,
    },
    scheduleAt: {
      type: Date,
      default: null,
    },
    msgHiddenByOtherUser: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

// TODO ! later Add index for scheduled messages query
// chatMessageSchema.index({ scheduleAt: 1 });

// Export both the model (for chatServer) and schema (for main app)
module.exports =
  mongoose.models?.chatmessages ||
  mongoose.model("chatmessages", chatMessageSchema);
module.exports.chatMessageSchema = chatMessageSchema;
