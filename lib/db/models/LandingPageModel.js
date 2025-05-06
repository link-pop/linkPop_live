import mongoose from "mongoose";

const landingPageSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      default: "",
    },
    profileImage: {
      type: String,
      default: "",
    },
    originalProfileImage: {
      type: String,
      default: "",
    },
    coverImage: {
      type: String,
      default: "",
    },
    originalCoverImage: {
      type: String,
      default: "",
    },
    active: {
      type: Boolean,
      default: true,
    },
    // Customization fields
    textColor: {
      type: String,
      default: "#ffffff",
    },
    bgColor: {
      type: String,
      default: "",
    },
    buttonTextColor: {
      type: String,
      default: "#ffffff",
    },
    buttonBgColor: {
      type: String,
      default: "#ffb6c1",
    },
    socialIconsType: {
      type: String,
      enum: ["type1", "type2"],
      default: "type2",
    },
    textShadow: {
      type: String,
      enum: ["none", "light", "medium", "strong"],
      default: "none",
    },
    textShadowColor: {
      type: String,
      default: "#000000",
    },
    buttonRoundness: {
      type: String,
      default: "medium",
    },
    buttonAnimation: {
      type: String,
      default: "none",
    },
    buttonShadow: {
      type: String,
      default: "none",
    },
    shadowColor: {
      type: String,
      default: "#000000",
    },
    fontFamily: {
      type: String,
      default: "default",
    },
    textFontSize: {
      type: String,
      default: "default",
    },
    buttonFontSize: {
      type: String,
      default: "default",
    },
    // New fields from the form image
    showOnline: {
      type: Boolean,
      default: true,
    },
    showCity: {
      type: Boolean,
      default: true,
    },
    responseTime: {
      type: String,
      default: "",
    },
    promotion: {
      type: String,
      default: "",
    },
    promotionTextColor: {
      type: String,
      default: "#FF0000",
    },
    promotionEndsIn: {
      type: String,
      default: "",
    },
    disableLinkLogos: {
      type: Boolean,
      default: false,
    },
    distanceFromVisitor: {
      type: String,
      default: "",
    },
    facebookPixelId: {
      type: String,
      default: "",
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

// Create indexes for faster queries
landingPageSchema.index({ createdBy: 1 });

// Define model settings
landingPageSchema.settings = {
  noFullPost: true,
};

export { landingPageSchema };

const LandingPageModel =
  mongoose.models?.landingpages ||
  mongoose.model("landingpages", landingPageSchema);

export default LandingPageModel;
