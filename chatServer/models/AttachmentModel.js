const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema(
  {
    fileUrl: {
      type: String,
      required: true,
    },
    blurredUrl: {
      type: String,
      required: false,
      default: null,
    },
    fileType: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: false, // for UPDATE MODE to work
    },
    fileBytes: {
      type: Number,
      required: true,
    },
    uploadedFrom: {
      type: String,
      required: true,
      enum: ["chatmessages", "welcomeMessage", "feeds", null],
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    relatedPostId: {
      type: mongoose.Schema.Types.ObjectId,
      // For chat messages, this should be set to the message ID, not the chat room ID
      // This allows proper purchase verification for paid content
    },
  },
  { timestamps: true }
);

// Create the model
const Attachment =
  mongoose?.models?.attachments ||
  mongoose.model("attachments", attachmentSchema);

// Export both the model and schema
module.exports = Attachment;
module.exports.attachmentSchema = attachmentSchema;
