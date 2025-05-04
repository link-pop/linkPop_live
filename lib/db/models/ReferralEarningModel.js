import mongoose from "mongoose";

const referralEarningSchema = new mongoose.Schema(
  {
    // Referrer who earns the commission
    referrerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },
    // Referred user who paid for subscription
    referredId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    // Subscription that generated this earning
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "subscriptions2",
      required: true,
    },
    // Original subscription amount (before commission)
    subscriptionAmount: {
      type: Number,
      required: true,
    },
    // Commission amount (20% of subscription)
    commissionAmount: {
      type: Number,
      required: true,
    },
    // Commission percentage used
    commissionPercentage: {
      type: Number,
      default: 20,
      required: true,
    },
    // Payment status
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    // External payment reference (if applicable)
    paymentReference: {
      type: String,
    },
    // When the commission was paid
    paidAt: {
      type: Date,
    },
    // Invoice period this earning relates to
    periodStart: {
      type: Date,
      required: true,
    },
    periodEnd: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// Create indexes for faster lookups
referralEarningSchema.index({ referrerId: 1, status: 1 });
referralEarningSchema.index({
  subscriptionId: 1,
  periodStart: 1,
  periodEnd: 1,
});

referralEarningSchema.settings = {
  noUpdateIcon: true,
  noDeleteIcon: false,
};

export { referralEarningSchema };
