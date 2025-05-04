import mongoose from "mongoose";

const commentsSchema = new mongoose.Schema(
  {
    createdBy: {
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
    text: {
      type: String,
      default: "",
      required: true,
    },
    likes: {
      type: Number,
      default: 0,
      required: false,
    },
  },
  { timestamps: true }
);

// ! IF POSTS used NOT is posts route they need manual settings SO THIS SETTINGS WON'T WORK
commentsSchema.settings = {
  hasComments: false, // Prevent recursive comments
};

export { commentsSchema };
