const mongoose = require("mongoose");

const storeItemsOrderSchema = new mongoose.Schema(
  {
    // User who placed the order
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    // Store owner who owns the items in this order
    storeOwner: {
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
        stockAtTime: {
          type: Number,
          default: 0,
          min: 0,
        }, // Stock available at time of purchase
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

    // Shippo integration fields
    shippoShipmentId: String,

    shippoRates: [
      {
        type: mongoose.Schema.Types.Mixed,
      },
    ],

    shippingLabelUrl: String,

    labelBrokerQRCodeUrl: String,

    shippoTransactionId: String,

    carrierAccount: String,

    // Stripe Connect transfer fields
    stripeTransferId: String, // Stripe transfer ID for platform fee handling
    platformFee: {
      type: Number,
      default: 0,
      min: 0,
    }, // Platform fee amount (in dollars)
    transferAmount: {
      type: Number,
      default: 0,
      min: 0,
    }, // Amount transferred to store owner (in dollars)
    transferStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    transferredAt: Date, // When the transfer was completed
    transferError: String, // Error message if transfer failed
    devMode: {
      type: Boolean,
      default: false,
    }, // Whether this order was processed in dev mode (bypassing Stripe Connect)

    // Cancellation and refund fields
    cancelledAt: Date,
    cancelReason: String, // "customer_request", "store_owner_cancel", etc.
    stripeRefundId: String, // Stripe refund ID
    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
    }, // Amount refunded (in dollars)
    refundedAt: Date, // When the refund was processed

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

// Only add indexes and middleware if schema hasn't been compiled yet
// Use multiple checks to ensure we don't duplicate indexes
if (!storeItemsOrderSchema.$compiled && !storeItemsOrderSchema.$indexesAdded) {
  try {
    // Indexes for better performance
    storeItemsOrderSchema.index({ createdBy: 1, createdAt: -1 });
    // orderNumber index is already created by unique: true property
    storeItemsOrderSchema.index({ stripeSessionId: 1 });
    storeItemsOrderSchema.index({ paymentStatus: 1 });
    storeItemsOrderSchema.index({ orderStatus: 1 });
    storeItemsOrderSchema.index({ storeOwner: 1 });

    // Mark that indexes have been added
    storeItemsOrderSchema.$indexesAdded = true;
  } catch (error) {
    // Silently ignore index errors (likely already compiled)
    console.log("Indexes already exist for storeitemsorders schema");
  }

  try {
    // Generate order number before saving
    storeItemsOrderSchema.pre("save", async function (next) {
      if (this.isNew && !this.orderNumber) {
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        this.orderNumber = `ORD-${timestamp}-${random}`;
      }
      next();
    });
  } catch (error) {
    // Silently ignore middleware errors (likely already added)
    console.log("Middleware already exists for storeitemsorders schema");
  }

  // Mark schema as compiled to prevent future modifications
  storeItemsOrderSchema.$compiled = true;
}

// Create and export the model for chatServer (CommonJS)
// Check if model already exists to prevent overwrite error
let StoreItemsOrder;
try {
  // Try to get existing model first
  StoreItemsOrder = mongoose.model("storeitemsorders");
} catch (error) {
  // Model doesn't exist, create it
  StoreItemsOrder = mongoose.model("storeitemsorders", storeItemsOrderSchema);
}

module.exports = StoreItemsOrder;

// Also export the schema for importing in models.js
module.exports.storeItemsOrderSchema = storeItemsOrderSchema;
