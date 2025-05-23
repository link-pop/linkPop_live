import mongoose from "mongoose";

const usersSchema = new mongoose.Schema(
  {
    // Account profile fields
    age: { type: Number, required: false },
    raceEthnicity: { type: String, required: false },
    hairColor: { type: String, required: false },
    bodyType: { type: String, required: false },

    // Onboarding fields
    profileType: { type: String, required: false }, // 'creator' or 'fan'
    onboardingFinished: { type: Boolean, default: false, required: false },

    // new fields
    showFansCount: { type: Boolean, default: true, required: false },
    showMediaCount: { type: Boolean, default: true, required: false },
    enableComments: { type: Boolean, default: true, required: false },
    showActivityStatus: { type: Boolean, default: true, required: false },
    autoFollowBackMyFans: { type: Boolean, default: true, required: false },
    subscriptionPrice: { type: Number, default: 0, required: false },

    // User preferences for suggestions
    hiddenSuggestions: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],

    // Image fields with original versions for cropping
    profileImage: { type: String, default: "" },
    originalProfileImage: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    originalCoverImage: { type: String, default: "" },

    // Subscription and trial tracking fields
    subscriptionHistory: {
      trialUsed: { type: Boolean, default: false }, // Has user ever used a trial
      trialEndedAt: { type: Date }, // When the last trial ended
      priorSubscriptions: [
        {
          planId: { type: String },
          startedAt: { type: Date },
          endedAt: { type: Date },
          status: { type: String },
        },
      ],
      currentPlanStartedAt: { type: Date }, // When current plan started (for analytics)
      lastCancellationDate: { type: Date }, // When user last canceled
      cancellationCount: { type: Number, default: 0 }, // How many times user has canceled
    },

    // Referral-related fields
    referralCode: { type: String, sparse: true, unique: true, index: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    referralCodeUsed: { type: String },
    referralStats: {
      totalReferrals: { type: Number, default: 0 },
      activeReferrals: { type: Number, default: 0 },
      totalEarnings: { type: Number, default: 0 },
      pendingEarnings: { type: Number, default: 0 },
      paidEarnings: { type: Number, default: 0 },
    },

    // TODO !!!!!!! DELETE
    // Social media links
    // socialMediaLinks: [
    //   {
    //     id: { type: String, required: true },
    //     platform: { type: String, required: true },
    //     username: { type: String, required: true },
    //     label: { type: String, required: true },
    //     createdAt: { type: Date, default: Date.now },
    //     updatedAt: { type: Date, default: Date.now },
    //   },
    // ],
    // TODO !!!!!!! DELETE

    // Required fields
    clerkId: { type: String, required: true },
    name: { type: String, default: "", required: true },
    email: { type: String, default: "", required: true },
    avatar: { type: String, default: "", required: true },
    isAvailable: { type: Boolean, default: true, required: false },

    // User profile
    plan: { type: String, default: "" },
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    fullName: { type: String, default: "" },
    primaryEmailAddress: { type: String, default: "" },
    primaryPhoneNumber: { type: String, default: "" },
    primaryWeb3Wallet: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    hasImage: { type: Boolean, default: false },
    gender: { type: String, default: "" },
    birthday: { type: String, default: "" },
    lastSignInAt: { type: Date },

    // Email and accounts
    emailAddresses: [
      {
        emailAddress: { type: String },
        verified: { type: Boolean },
      },
    ],
    phoneNumbers: [String],
    externalAccounts: [
      {
        provider: { type: String },
        emailAddress: { type: String },
        username: { type: String },
      },
    ],

    // Location
    ip: { type: String },
    city: { type: String },
    region: { type: String },
    country: { type: String },
    continent: { type: String },
    postal: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    timezone: { type: String },
    currency: { type: String },
    languages: [String],
    asn: { type: String },
    org: { type: String },

    // Device and network
    effectiveType: { type: String },
    downlink: { type: Number },
    rtt: { type: Number },
    saveData: { type: Boolean },
    batteryLevel: { type: Number },
    batteryCharging: { type: Boolean },
    batteryChargingTime: { type: Number },
    batteryDischargingTime: { type: Number },
    userAgent: { type: String },
    platform: { type: String },
    colorDepth: { type: Number },
    timezoneOffset: { type: Number },
    doNotTrack: { type: String },
    onLine: { type: Boolean },
    vendor: { type: String },
    hardwareConcurrency: { type: Number },
    maxTouchPoints: { type: Number },
    pdfViewerEnabled: { type: Boolean },
    devicePixelRatio: { type: Number },
    screenOrientation: { type: String },

    // System info
    countryCode: { type: String },
    platformType: { type: String },
    screenResolution: { type: String },
    language: { type: String },
    deviceMemory: { type: String },
    colorScheme: { type: String },
    reducedMotion: { type: String },
    cookiesEnabled: { type: String },
  },
  { timestamps: true, strict: false }
);

usersSchema.settings = {
  noUpdateIcon: true,
  noDeleteIcon: true,
};

export { usersSchema };
