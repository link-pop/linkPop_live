import mongoose from "mongoose";

const feedsSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    text: { type: String, default: "", required: true },
    files: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "attachments",
        required: false,
      },
    ],
    likes: { type: Number, default: 0, required: false },
    comments: {
      type: Number,
      default: 0,
      required: false,
    },
    active: { type: Boolean, default: true, required: false },
    expirationPeriod: { type: Number, default: 0, required: false },
    scheduleAt: { type: Date, default: null, required: false },
    price: { type: Number, default: 0, required: false },
  },
  { timestamps: true, strict: true }
);

feedsSchema.settings = {
  hasLikes: true,
  hasComments: true,
  fields: {
    text: {
      subtype: "text",
    },
  },
};

export { feedsSchema };
