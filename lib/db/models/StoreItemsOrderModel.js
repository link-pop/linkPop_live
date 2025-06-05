import mongoose from "mongoose";

export const storeItemsOrderSchema = new mongoose.Schema(
  {
    // User who placed the order
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    // Order details
    orderNumber: {
      type: String,
      unique: true,
    },

    // Items in the order
    items: [
      {
        storeItemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "storeitems",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        priceAtTime: {
          type: Number,
          required: true,
          min: 0,
        },
        title: String, // Store item title at time of purchase
        category: String, // Store item category at time of purchase
      },
    ],

    // Order totals
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    tax: {
      type: Number,
      default: 0,
      min: 0,
    },

    shipping: {
      type: Number,
      default: 0,
      min: 0,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    // Payment information
    stripeSessionId: {
      type: String,
      required: true,
    },

    stripePaymentIntentId: String,

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    // Order status
    orderStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },

    // Shipping information
    shippingAddress: {
      name: String,
      line1: String,
      line2: String,
      city: String,
      state: String,
      postal_code: String,
      country: String,
    },

    // Tracking information
    trackingNumber: String,

    shippedAt: Date,

    deliveredAt: Date,

    // Notes
    notes: String,

    // Metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
storeItemsOrderSchema.index({ createdBy: 1, createdAt: -1 });
storeItemsOrderSchema.index({ orderNumber: 1 });
storeItemsOrderSchema.index({ stripeSessionId: 1 });
storeItemsOrderSchema.index({ paymentStatus: 1 });
storeItemsOrderSchema.index({ orderStatus: 1 });

// Generate order number before saving
storeItemsOrderSchema.pre("save", async function (next) {
  if (this.isNew && !this.orderNumber) {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.orderNumber = `ORD-${timestamp}-${random}`;
  }
  next();
});
