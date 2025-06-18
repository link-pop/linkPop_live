"use server";

import { getOne, update } from "./crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import { revalidatePath } from "next/cache";
import { formatPrice } from "@/lib/utils/formatPrice";
import { addDevStatus } from "@/lib/utils/mongo/addDevStatus";

// Place a bid on an auction item
export const placeBid = async ({ auctionItemId, bidAmount }) => {
  try {
    const { mongoUser } = await getMongoUser();
    if (!mongoUser?._id) {
      return { error: "User not authenticated" };
    }

    // Get the auction item
    const auctionItem = await getOne({
      col: "storeitems",
      data: { _id: auctionItemId, type: "auction" },
    });

    if (!auctionItem) {
      return { error: "Auction item not found" };
    }

    // Check if user is the owner
    if (auctionItem.createdBy.toString() === mongoUser._id.toString()) {
      return { error: "Cannot bid on your own auction" };
    }

    // Check auction timing
    const now = new Date();
    const startTime = new Date(auctionItem.auctionStartTime);
    const endTime = new Date(auctionItem.auctionEndTime);

    if (now < startTime) {
      return { error: "Auction has not started yet" };
    }

    if (now >= endTime) {
      return { error: "Auction has ended" };
    }

    // Check auction status
    if (
      auctionItem.auctionStatus !== "active" &&
      auctionItem.auctionStatus !== "pending"
    ) {
      return { error: "Auction is not active" };
    }

    // Validate bid amount
    const currentBid = auctionItem.auctionCurrentBid?.amount || 0;
    const startPrice = auctionItem.auctionStartPrice || 0;
    const minBidIncrement = auctionItem.auctionMinBidIncrement || 1;
    const minNextBid = Math.max(currentBid, startPrice) + minBidIncrement;

    if (bidAmount < minNextBid) {
      return {
        error: `Bid must be at least $${minNextBid.toFixed(2)}`,
      };
    }

    // Check if user is already the highest bidder
    if (
      auctionItem.auctionCurrentBid?.bidderId?.toString() ===
      mongoUser._id.toString()
    ) {
      return { error: "You are already the highest bidder" };
    }

    // Prepare new bid
    const newBid = {
      bidderId: mongoUser._id,
      amount: bidAmount,
      bidTime: new Date(),
      isWinning: true,
    };

    // Prepare updated auction data
    const updateData = {
      auctionCurrentBid: {
        amount: bidAmount,
        bidderId: mongoUser._id,
        bidTime: new Date(),
      },
      auctionStatus: "active", // Ensure status is active when bid is placed
      $push: {
        auctionBids: newBid,
      },
    };

    // Mark previous bids as not winning
    if (auctionItem.auctionBids && auctionItem.auctionBids.length > 0) {
      const updatedBids = auctionItem.auctionBids.map((bid) => ({
        ...bid,
        isWinning: false,
      }));
      updatedBids.push(newBid);
      updateData.auctionBids = updatedBids;
      delete updateData.$push; // Remove $push since we're replacing the entire array
    }

    // Update the auction item
    const result = await update({
      col: "storeitems",
      data: { _id: auctionItemId },
      update: updateData,
      skipOwnershipCheck: true, // We've already validated ownership above
    });

    if (result.error) {
      return { error: result.error };
    }

    // Revalidate relevant paths
    revalidatePath("/");
    revalidatePath(`/storeitems/${auctionItemId}`);

    return {
      success: true,
      bidAmount,
      message: "Bid placed successfully",
    };
  } catch (error) {
    console.error("❌ Error placing bid:", error);
    return { error: error.message || "Failed to place bid" };
  }
};

// Buy now functionality for auction items - CREATE STRIPE SESSION FIRST
export const buyNowCreateStripeSession = async ({ auctionItemId }) => {
  try {
    const { mongoUser } = await getMongoUser();
    if (!mongoUser?._id) {
      return { error: "User not authenticated" };
    }

    // Get the auction item with populated createdBy
    const auctionItem = await getOne({
      col: "storeitems",
      data: { _id: auctionItemId, type: "auction" },
      populate: ["createdBy"],
    });

    if (!auctionItem) {
      return { error: "Auction item not found" };
    }

    // Add dev status to the store owner (createdBy)
    if (auctionItem.createdBy) {
      auctionItem.createdBy = addDevStatus(auctionItem.createdBy);
    }

    // Check if user is the owner
    if (auctionItem.createdBy.toString() === mongoUser._id.toString()) {
      return { error: "Cannot buy your own auction item" };
    }

    // Check if buy now is available
    if (!auctionItem.auctionBuyNowPrice) {
      return { error: "Buy now option is not available for this auction" };
    }

    // Check auction timing
    const now = new Date();
    const startTime = new Date(auctionItem.auctionStartTime);
    const endTime = new Date(auctionItem.auctionEndTime);

    if (now < startTime) {
      return { error: "Auction has not started yet" };
    }

    if (now >= endTime) {
      return { error: "Auction has ended" };
    }

    // Check auction status
    if (
      auctionItem.auctionStatus === "ended" ||
      auctionItem.auctionStatus === "cancelled"
    ) {
      return { error: "Auction has ended or been cancelled" };
    }

    // VALIDATION: Check if buy now price is higher than current bid
    const currentBid = auctionItem.auctionCurrentBid?.amount || 0;
    const startPrice = auctionItem.auctionStartPrice || 0;
    const highestPrice = Math.max(currentBid, startPrice);

    if (auctionItem.auctionBuyNowPrice <= highestPrice) {
      return {
        error: `Buy now price must be higher than the current highest price of ${formatPrice(
          highestPrice
        )}`,
      };
    }

    // Return auction data for Stripe session creation
    // DON'T end the auction here - that happens after payment
    return {
      success: true,
      auctionItem,
      buyNowPrice: auctionItem.auctionBuyNowPrice,
      message: "Ready for payment processing",
    };
  } catch (error) {
    console.error("❌ Error preparing buy now:", error);
    return { error: error.message || "Failed to prepare purchase" };
  }
};

// Complete buy now after successful payment - CALLED FROM STRIPE SUCCESS
export const completeBuyNowAfterPayment = async ({
  auctionItemId,
  stripeSessionId,
}) => {
  try {
    const { mongoUser } = await getMongoUser();
    if (!mongoUser?._id) {
      return { error: "User not authenticated" };
    }

    // Get the auction item
    const auctionItem = await getOne({
      col: "storeitems",
      data: { _id: auctionItemId, type: "auction" },
    });

    if (!auctionItem) {
      return { error: "Auction item not found" };
    }

    // Check if user is the owner
    if (auctionItem.createdBy.toString() === mongoUser._id.toString()) {
      return { error: "Cannot buy your own auction item" };
    }

    // Check if buy now is available
    if (!auctionItem.auctionBuyNowPrice) {
      return { error: "Buy now option is not available for this auction" };
    }

    // Check if auction is already ended
    if (auctionItem.auctionStatus === "ended") {
      return { error: "Auction has already ended" };
    }

    // End the auction and set the winner
    const updateData = {
      auctionStatus: "ended",
      auctionWinnerId: mongoUser._id,
      auctionCurrentBid: {
        amount: auctionItem.auctionBuyNowPrice,
        bidderId: mongoUser._id,
        bidTime: new Date(),
      },
      auctionEndTime: new Date(), // Set end time to now
    };

    // Add the buy now transaction to bids
    const buyNowBid = {
      bidderId: mongoUser._id,
      amount: auctionItem.auctionBuyNowPrice,
      bidTime: new Date(),
      isWinning: true,
      isBuyNow: true, // Flag to indicate this was a buy now purchase
    };

    // Mark all previous bids as not winning and add buy now bid
    if (auctionItem.auctionBids && auctionItem.auctionBids.length > 0) {
      const updatedBids = auctionItem.auctionBids.map((bid) => ({
        ...bid,
        isWinning: false,
      }));
      updatedBids.push(buyNowBid);
      updateData.auctionBids = updatedBids;
    } else {
      updateData.auctionBids = [buyNowBid];
    }

    // Update the auction item
    const result = await update({
      col: "storeitems",
      data: { _id: auctionItemId },
      update: updateData,
      skipOwnershipCheck: true, // We've already validated ownership above
    });

    if (result.error) {
      return { error: result.error };
    }

    // Revalidate relevant paths
    revalidatePath("/");
    revalidatePath(`/storeitems/${auctionItemId}`);

    return {
      success: true,
      purchasePrice: auctionItem.auctionBuyNowPrice,
      message: "Item purchased successfully",
      stripeSessionId,
    };
  } catch (error) {
    console.error("❌ Error completing buy now:", error);
    return { error: error.message || "Failed to complete purchase" };
  }
};

// Legacy buy now function - DEPRECATED, use buyNowCreateStripeSession instead
export const buyNow = async ({ auctionItemId }) => {
  // Redirect to the new flow
  return await buyNowCreateStripeSession({ auctionItemId });
};
