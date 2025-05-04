import mongoose from "mongoose";

const featuresSchema = new mongoose.Schema(
  {
    title: { type: String, default: "", required: true },
    desc: { type: String, default: "", required: true },
    files: { type: Array, default: [], required: true },
    order: { type: Number, default: 0, required: false },
  },
  { timestamps: true }
);

featuresSchema.settings = {
  noFullPost: true,
  onNavClickScroll: true,
  sort: { order: 1 },
};

export const featureModel =
  mongoose.models?.features || mongoose.model("features", featuresSchema);
