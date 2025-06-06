import mongoose from "mongoose";

const userCartSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    storeItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "storeitems",
      required: true,
    },
    storeOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: false,
      default: null,
    },
    quantity: {
      type: Number,
      default: 1,
      required: true,
      min: 1,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true, strict: true }
);

// Create compound index to prevent duplicate items in cart from same store owner
userCartSchema.index(
  { createdBy: 1, storeItemId: 1, storeOwner: 1 },
  { unique: true }
);

// Index for efficient queries by user and store owner
userCartSchema.index({ createdBy: 1, storeOwner: 1 });

export { userCartSchema };
