import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    country: {
      type: String,
      required: true,
    },
    country_code: {
      type: String,
      default: "",
    },
    state: {
      type: String,
      default: "",
    },
    state_code: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const geoFilterSchema = new mongoose.Schema(
  {
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    entityType: {
      type: String,
      enum: ["landingpage", "directlink", "user"],
      required: true,
    },
    mode: {
      type: String,
      enum: ["allow", "block"],
      required: true,
      default: "block",
    },
    locations: {
      type: [locationSchema],
      default: [],
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Create compound index for faster queries
geoFilterSchema.index({ entityId: 1, entityType: 1 }, { unique: true });

// Export the schema for use in models.js
export { geoFilterSchema };

const GeoFilterModel =
  mongoose.models?.geofilters || mongoose.model("geofilters", geoFilterSchema);

export default GeoFilterModel;
