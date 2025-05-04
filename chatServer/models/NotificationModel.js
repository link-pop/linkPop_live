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
      enum: ["chatmessages", "feeds", "comments", "users"],
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
  },
  { timestamps: true }
);

notificationSchema.settings = {
  hasLikes: false,
  hasComments: false,
  noFullPost: true,
};

// Try-catch to handle potential model compilation errors
try {
  // Check if the model already exists to prevent OverwriteModelError
  if (mongoose.models && mongoose.models.notifications) {
    module.exports = mongoose.models.notifications;
  } else {
    module.exports = mongoose.model("notifications", notificationSchema);
  }
} catch (error) {
  console.error("Error creating notifications model:", error);
  // Fallback: try to use existing model
  module.exports =
    mongoose.models.notifications ||
    mongoose.model("notifications", notificationSchema);
}

// Also export the schema for importing in models.js
module.exports.notificationSchema = notificationSchema;
