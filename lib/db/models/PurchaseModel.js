import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    postType: {
      type: String,
      required: true,
      enum: ["feeds", "chatmessages"],
      default: "feeds",
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    stripeSessionId: {
      type: String,
      required: false, // Changed to false to allow creation before we have a session ID
      sparse: true,    // Only enforce uniqueness on non-null values
    },
  },
  { timestamps: true, strict: true }
);

// Create a compound index to ensure a user can only purchase a post once
purchaseSchema.index({ userId: 1, postId: 1 }, { unique: true });

// Create an index on stripeSessionId for faster lookups
purchaseSchema.index({ stripeSessionId: 1 }, { sparse: true });

export { purchaseSchema };
