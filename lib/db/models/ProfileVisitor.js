import mongoose from "mongoose";

// TODO !!!!!!! rename to ...+Model
const profileVisitorSchema = new mongoose.Schema(
  {
    // Who visited
    visitorId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },

    // Which profile was visited
    profileId: { type: mongoose.Schema.Types.ObjectId, required: true },
    profileType: {
      type: String,
      required: true,
      enum: ["user", "directlink", "landingpage"],
    },

    // Visit details
    ipAddress: { type: String },
    userAgent: { type: String },
    referrer: { type: String },

    // For direct links
    redirected: { type: Boolean, default: false },
    destinationUrl: { type: String },

    // Geo data
    country_code: { type: String },
    country_name: { type: String },
    language: { type: String },
    timezone: { type: String },
    city: { type: String },
    region: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    currency: { type: String },
    mobile: { type: Boolean },
    proxy: { type: Boolean },
    hosting: { type: Boolean },
    isp: { type: String },
    org: { type: String },
    continent_code: { type: String },

    // IP address from the geo service
    ip: { type: String },
  },
  {
    timestamps: true,
    // This ensures all fields are saved even if not in schema
    strict: false,
  }
);

profileVisitorSchema.settings = {
  noUpdateIcon: true,
  noDeleteIcon: false,
};

export { profileVisitorSchema };
