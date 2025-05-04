import mongoose from "mongoose";

const socialLinkSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },
    landingPageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "landingpages",
      required: false,
    },
    platform: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: false,
    },
    websiteUrl: {
      type: String,
      required: false,
    },
    label: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    clickCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Create an index for faster queries
socialLinkSchema.index({ createdBy: 1, order: 1 });

socialLinkSchema.settings = {
  noUpdateIcon: false,
  noDeleteIcon: false,
};

export { socialLinkSchema };
