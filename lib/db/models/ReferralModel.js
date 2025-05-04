import mongoose from "mongoose";

const referralSchema = new mongoose.Schema(
  {
    // Referrer (user who referred)
    referrerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },
    // Referred user (new user who signed up)
    referredId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },
    // Referral code used
    referralCode: {
      type: String,
      required: true,
    },
    // Status of the referral
    status: {
      type: String,
      enum: ["pending", "active", "cancelled"],
      default: "pending",
    },
    // Timestamp when this referral became active (usually after first payment)
    activatedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Create an index for faster referral lookups
referralSchema.index({ referralCode: 1 });
referralSchema.index({ referrerId: 1, referredId: 1 }, { unique: true });

referralSchema.settings = {
  noUpdateIcon: true,
  noDeleteIcon: false,
};

export { referralSchema };
