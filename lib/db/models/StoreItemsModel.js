import mongoose from "mongoose";

const storeitemsSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    text: { type: String, default: "", required: true },
    files: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "attachments",
        required: false,
      },
    ],
    price: { type: Number, default: 0, required: true },
    stock: { type: Number, default: 0, required: true, min: 0 },
    active: { type: Boolean, default: true, required: false },
    title: { type: String, default: "", required: false },
    category: { type: String, default: "", required: false },

    // Item type: "regular" or "auction"
    type: {
      type: String,
      enum: ["regular", "auction"],
      default: "regular",
      required: true,
    },

    // Auction-specific fields
    auctionStartPrice: {
      type: Number,
      default: 0,
      required: function () {
        return this.type === "auction";
      },
    },
    auctionStartTime: {
      type: Date,
      required: function () {
        return this.type === "auction";
      },
    },
    auctionEndTime: {
      type: Date,
      required: function () {
        return this.type === "auction";
      },
    },
    auctionCurrentBid: {
      amount: { type: Number, default: 0 },
      bidderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        default: null,
      },
      bidTime: { type: Date, default: null },
    },
    auctionStatus: {
      type: String,
      enum: ["pending", "active", "ended", "cancelled"],
      default: function () {
        return this.type === "auction" ? "pending" : undefined;
      },
    },
    auctionWinnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },
    auctionBids: [
      {
        bidderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "users",
          required: true,
        },
        amount: { type: Number, required: true, min: 0 },
        bidTime: { type: Date, default: Date.now },
        isWinning: { type: Boolean, default: false },
      },
    ],

    // Auction settings
    auctionMinBidIncrement: {
      type: Number,
      default: 1,
      required: function () {
        return this.type === "auction";
      },
    },
    auctionBuyNowPrice: {
      type: Number,
      default: null, // Optional buy-now price
    },
    auctionReservePrice: {
      type: Number,
      default: null, // Optional reserve price
    },
  },
  { timestamps: true, strict: true }
);

// Indexes for auction queries
storeitemsSchema.index({ type: 1, auctionStatus: 1, auctionEndTime: 1 });
storeitemsSchema.index({ auctionEndTime: 1 });
storeitemsSchema.index({ "auctionCurrentBid.bidderId": 1 });

// Pre-save middleware to update auction status
storeitemsSchema.pre("save", function (next) {
  if (this.type === "auction") {
    const now = new Date();

    if (this.auctionEndTime <= now && this.auctionStatus === "active") {
      this.auctionStatus = "ended";

      // Set winner if there are bids
      if (this.auctionCurrentBid.bidderId) {
        this.auctionWinnerId = this.auctionCurrentBid.bidderId;
      }
    } else if (
      this.auctionStartTime <= now &&
      this.auctionStatus === "pending"
    ) {
      this.auctionStatus = "active";
    }
  }
  next();
});

export { storeitemsSchema };
