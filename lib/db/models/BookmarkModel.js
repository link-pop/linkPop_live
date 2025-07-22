import mongoose from "mongoose";

const bookmarksSchema = new mongoose.Schema(
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
      default: "feeds", // Only for feeds
    },
  },
  { timestamps: true }
);

// Compound index to ensure unique bookmarks
bookmarksSchema.index({ userId: 1, postId: 1, postType: 1 }, { unique: true });

bookmarksSchema.settings = {
  displayName: "Bookmarks",
  hasLikes: false, // Prevent recursive likes
};

export { bookmarksSchema }; 