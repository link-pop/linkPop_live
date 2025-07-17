const mongoose = require("mongoose");

const userNotesSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    entityType: {
      type: String,
      enum: ["chatroom", "user", "post", "feed", "storeitem"],
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    noteText: {
      type: String,
      required: true,
      maxLength: 1000,
    },
  },
  { timestamps: true }
);

// Create compound index for efficient queries
userNotesSchema.index(
  { createdBy: 1, entityType: 1, entityId: 1 },
  { unique: true }
);

userNotesSchema.settings = {
  hasLikes: false,
  hasComments: false,
  noFullPost: true,
};

// Export both the model (for chatServer) and schema (for main app)
module.exports =
  mongoose.models?.usernotes || mongoose.model("usernotes", userNotesSchema);
module.exports.userNotesSchema = userNotesSchema;
