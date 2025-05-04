import mongoose from "mongoose";

const directlinkSchema = new mongoose.Schema(
  {
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    name: { type: String, required: true },
    destinationUrl: { type: String, required: true },
    freeUrl: { type: String, required: false },
    desc: { type: String, default: "" },
    active: { type: Boolean, default: true },
    facebookPixelId: {
      type: String,
      default: "",
    },
    shieldProtection: {
      type: Boolean,
      default: true,
    },
    safePageUrl: {
      type: String,
      default: "https://www.google.com",
    },
    // GeoFilter fields
    geoFilterActive: {
      type: Boolean,
      default: false,
    },
    geoFilterMode: {
      type: String,
      enum: ["allow", "block"],
      default: "block",
    },
    geoFilterLocations: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

directlinkSchema.settings = {
  noFullPost: true,
};

export { directlinkSchema };
