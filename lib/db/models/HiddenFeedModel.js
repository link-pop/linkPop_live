import mongoose from "mongoose";

const hiddenFeedsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "feeds" },
});

export { hiddenFeedsSchema };
