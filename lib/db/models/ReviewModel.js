import mongoose from "mongoose";

// TODO move all models to models.js SEPARATE FILES for EACH MODEL
// * ################# review #################
const reviewSchema = new mongoose.Schema(
  {
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    userId: { type: String, required: true },
    postId: { type: mongoose.Schema.Types.ObjectId, refPath: "postCol.name" },
    postCol: { type: Object, required: true },
    reviewed_collection: { type: String, required: true },
    rating: { type: Number, default: 0, required: true },
    text: { type: String, default: "", required: false },
    likes: { type: Number, default: 0, required: false },
  },
  { timestamps: true }
);
reviewSchema.settings = {
  hasLikes: true,
  noFullPost: true,
  fields: {
    reviewed_collection: { isHidden: true },
  },
};

export { reviewSchema };
