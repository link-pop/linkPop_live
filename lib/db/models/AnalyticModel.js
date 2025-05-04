import mongoose from "mongoose";

const analyticSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: false,
    },
    path: String,
    searchParams: { type: String, required: false },
    visitorId: String,
    userAgent: String,
    referrer: String,
    userId: { type: String, required: false },
    countryCode: String,
    platformType: String,
    browserType: String,
    systemType: String,
    postType: String,
    postId: String,
    email: String,
    screenResolution: String,
    language: String,
    deviceMemory: String,
    timeZone: String,
    hardwareConcurrency: String,
    colorScheme: String,
    reducedMotion: String,
    cookiesEnabled: String,
  },
  {
    timestamps: true,
  }
);

analyticSchema.settings = {
  displayName: "History",
  noFullPost: true,
  noUpdateIcon: true,
  noDeleteIcon: true,
};

export { analyticSchema };
