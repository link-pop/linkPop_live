import mongoose from "mongoose";

const pricingsSchema = new mongoose.Schema(
  {
    title: { type: String, default: "", required: true },
    price: { type: Number, default: 0, required: true },
    features: { type: Array, default: [], required: true },
    order: { type: Number, default: 0, required: false },
    "bg color": { type: String, default: "#ffffff", required: false },
    "text color": { type: String, default: "#000000", required: false },
    applyButtonText: {
      type: String,
      default: "apply for membership",
      required: false,
    },
  },
  { timestamps: true }
);

pricingsSchema.settings = {
  displayName: "membership options",
  noFullPost: true,
  onNavClickScroll: true,
  sort: { order: 1 },
  fields: {
    "bg color": {
      displayName: "background color",
    },
    "text color": {
      displayName: "text color",
    },
    applyButtonText: {
      displayName: "apply button text",
    },
  },
};

export const pricingModel =
  mongoose.models?.pricings || mongoose.model("pricings", pricingsSchema);
