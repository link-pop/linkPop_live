import mongoose from "mongoose";

const likesSchema = new mongoose.Schema(
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
    },
  },
  { timestamps: true }
);

// Compound index to ensure unique likes
likesSchema.index({ userId: 1, postId: 1, postType: 1 }, { unique: true });

likesSchema.settings = {
  displayName: "Likes",
  hasLikes: false, // Prevent recursive likes
};

export { likesSchema };
