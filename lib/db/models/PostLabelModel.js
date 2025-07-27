import mongoose from "mongoose";

const postLabelsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "feeds", // Add ref to enable population
      required: true,
    },
    postType: {
      type: String,
      required: true,
      default: "feeds", // Only for feeds
    },
  },
  { timestamps: true }
);

// Compound index to ensure unique post labels
postLabelsSchema.index({ userId: 1, postId: 1, postType: 1 }, { unique: true });

postLabelsSchema.settings = {
  displayName: "Post Labels",
  hasLikes: false, // Prevent recursive likes
};

export { postLabelsSchema };
