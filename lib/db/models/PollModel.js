import mongoose from "mongoose";

const pollOptionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  votes: { type: Number, default: 0, required: false },
  voters: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: false,
    },
  ],
});

const pollSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "feeds",
      required: true,
    },
    question: { type: String, required: true },
    options: [pollOptionSchema],
    duration: { type: Number, default: null, required: false }, // in days, null = no limit
    expiresAt: { type: Date, default: null, required: false },
    totalVotes: { type: Number, default: 0, required: false },
    isActive: { type: Boolean, default: true, required: false },
  },
  { timestamps: true, strict: true }
);

// Create index for faster queries
pollSchema.index({ postId: 1 });
pollSchema.index({ expiresAt: 1 });

export { pollSchema };
