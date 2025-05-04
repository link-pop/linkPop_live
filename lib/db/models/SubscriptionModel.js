import mongoose from "mongoose";

// * ################# subscription #################
const subscriptionsSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    subscribedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    active: { type: Boolean, default: true },
    isPaid: { type: Boolean, default: false },
    price: { type: Number, default: 0 },
    stripeSessionId: { type: String, sparse: true, index: true },
    paymentStatus: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

subscriptionsSchema.settings = {};

export { subscriptionsSchema };
