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
      enum: ["pending", "processing", "paid", "failed"],
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
    // Stripe payment intent that generated this earning (from subscription payment)
    stripePaymentIntentId: {
      type: String,
      required: false, // Made optional since not all subscriptions have payment intents immediately
    },
    // Stripe Connect transfer fields
    stripeTransferId: {
      type: String,
    },
    transferStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
    },
    transferredAt: {
      type: Date,
    },
    transferError: {
      type: String,
    },
    // For dev mode transfers
    devMode: {
      type: Boolean,
      default: false,
    },
    // Batch processing tracking
    payoutBatchId: {
      type: String,
    },
    processedAt: {
      type: Date,
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
referralEarningSchema.index({ stripeTransferId: 1 });
referralEarningSchema.index({ payoutBatchId: 1 });
referralEarningSchema.index({ stripePaymentIntentId: 1 });

// Prevent duplicate earnings for the same subscription period
referralEarningSchema.index(
  {
    referrerId: 1,
    referredId: 1,
    subscriptionId: 1,
    periodStart: 1,
    periodEnd: 1,
  },
  { unique: true }
);

referralEarningSchema.settings = {
  noUpdateIcon: true,
  noDeleteIcon: false,
};

export { referralEarningSchema };
