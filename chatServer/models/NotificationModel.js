const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "message",
        "like",
        "unlike",
        "comment",
        "follow",
        "unfollow",
        "mention",
        "system",
        "auction_won",
        "auction_sold",
        "auction_ended",
        "auction_outbid",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "sourceModel",
    },
    sourceModel: {
      type: String,
      enum: ["chatmessages", "feeds", "comments", "users", "storeitems"],
    },
    sourceUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    read: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String,
      default: "",
    },
    needsSocketNotification: {
      type: Boolean,
      default: false,
    },
    socketNotificationSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

notificationSchema.settings = {
  hasLikes: false,
  hasComments: false,
  noFullPost: true,
};

// Create and export the model for chatServer (CommonJS)
// Check if model already exists to prevent overwrite error
const Notification =
  mongoose.models?.notifications ||
  mongoose.model("notifications", notificationSchema);

module.exports = Notification;

// Also export the schema for importing in models.js
module.exports.notificationSchema = notificationSchema;
