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

// Create compound index to prevent duplicate items in cart
userCartSchema.index({ createdBy: 1, storeItemId: 1 }, { unique: true });

userCartSchema.settings = {
  hasLikes: false,
  hasViews: false,
  fields: {
    quantity: {
      displayName: "Quantity",
    },
    addedAt: {
      displayName: "Added At",
    },
  },
};

export { userCartSchema };
