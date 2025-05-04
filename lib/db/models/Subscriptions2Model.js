import mongoose from "mongoose";

const Subscriptions2Schema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
    customerId: {
      type: String,
      required: true,
    },
    subscriptionId: {
      type: String,
      required: true,
    },
    planId: {
      type: String,
      required: true,
    },
    // Extra links feature
    extraLinks: {
      type: Number,
      required: false,
      default: 0,
    },
    // Referral-related fields
    referrerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: false,
    },
    referralCode: {
      type: String,
      required: false,
    },
    // Commission calculation fields
    amount: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: "usd",
    },
    referralCommissionPercentage: {
      type: Number,
      default: 20,
    },
    referralCommissionPaid: {
      type: Boolean,
      default: false,
    },
    // Original subscription fields
    status: {
      type: String,
      enum: [
        "active",
        "canceled",
        "incomplete",
        "incomplete_expired",
        "past_due",
        "trialing",
        "unpaid",
      ],
      required: true,
    },
    currentPeriodStart: {
      type: Date,
      required: true,
    },
    currentPeriodEnd: {
      type: Date,
      required: true,
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
    canceledAt: {
      type: Date,
    },
    // Plan change tracking fields
    cancelReason: {
      type: String,
      enum: [
        "plan_change",
        "plan_upgrade",
        "plan_downgrade",
        "user_cancel",
        "payment_failed",
        "other",
      ],
    },
    newPlanId: {
      type: String,
    },
    trialStart: {
      type: Date,
    },
    trialEnd: {
      type: Date,
    },
    // Trial-specific fields
    trialDurationDays: {
      type: Number,
      default: 0,
    },
    trialActivated: {
      type: Boolean,
      default: false,
    },
    trialConvertedAt: {
      type: Date,
    },
    metadata: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

// Create a unique compound index to ensure one active subscription per user
Subscriptions2Schema.index({ createdBy: 1, status: 1 });

// Add settings for the schema similar to other models
Subscriptions2Schema.settings = {
  hasLikes: false,
  hasComments: false,
};

export { Subscriptions2Schema };
