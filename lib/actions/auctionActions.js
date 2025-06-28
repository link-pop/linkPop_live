"use server";

import { add, getOne, update, getAll } from "./crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import { revalidatePath } from "next/cache";
import { formatPrice } from "@/lib/utils/formatPrice";
import { addDevStatus } from "@/lib/utils/mongo/addDevStatus";
import { sendAuctionNewBidNotificationToParticipants } from "./emailNotifications";

// Check if user has unpaid won auctions
export const checkUnpaidWonAuctions = async () => {
  try {
    const { mongoUser } = await getMongoUser();
    if (!mongoUser?._id) {
      return { error: "User not authenticated" };
    }

    // Find auctions where user is the winner but hasn't paid
    const unpaidWonAuctions = await getAll({
      col: "storeitems",
      data: {
        type: "auction",
        auctionStatus: "ended",
        auctionWinnerId: mongoUser._id,
      },
      populate: [
        {
          path: "files",
        },
        {
          path: "createdBy",
        },
      ],
    });

    if (!unpaidWonAuctions || unpaidWonAuctions.length === 0) {
      return { hasUnpaidAuctions: false, unpaidAuctions: [] };
    }

    // Check each auction to see if it's been paid for
    const actuallyUnpaidAuctions = [];

    for (const auction of unpaidWonAuctions) {
      // Check if there's a paid order for this auction item by this user
      const paidOrder = await getOne({
        col: "storeitemsorders",
        data: {
          createdBy: mongoUser._id,
          "items.storeItemId": auction._id,
          paymentStatus: "paid",
          $or: [
            { "metadata.auctionWinnerPayment": true },
            { "metadata.auctionBuyNow": true },
          ],
        },
      });

      // If no paid order found, this auction is unpaid
      if (!paidOrder) {
        actuallyUnpaidAuctions.push(auction);
      }
    }

    return {
      hasUnpaidAuctions: actuallyUnpaidAuctions.length > 0,
      unpaidAuctions: actuallyUnpaidAuctions,
      count: actuallyUnpaidAuctions.length,
    };
  } catch (error) {
    console.error("❌ Error checking unpaid won auctions:", error);
    return { error: error.message || "Failed to check unpaid won auctions" };
  }
};

// Place a bid on an auction item
export const placeBid = async ({ auctionId, bidAmount }) => {
  try {
    const { mongoUser } = await getMongoUser();
    if (!mongoUser?._id) {
      return { error: "User not authenticated" };
    }

    // Check if user is allowed to bid on auctions
    if (mongoUser.auctionBidAllowed === false) {
      return {
        error:
          "You are not allowed to bid on auctions. This restriction was placed because you failed to purchase a previously won auction item within 7 days.",
      };
    }

    // Check if user has unpaid won auctions
    const unpaidCheck = await checkUnpaidWonAuctions();
    if (unpaidCheck.error) {
      console.error("Error checking unpaid auctions:", unpaidCheck.error);
      // Don't block bidding if we can't check - just log the error
    } else if (unpaidCheck.hasUnpaidAuctions) {
      return {
        error: "You have unpaid won auctions - pay them first to proceed",
      };
    }

    console.log(
      "🔍 Placing bid - auctionId:",
      auctionId,
      "bidAmount:",
      bidAmount
    );

    // Get the auction item
    const auction = await getOne({
      col: "storeitems",
      data: { _id: auctionId, type: "auction" },
    });

    console.log("🔍 Auction found:", !!auction, "auction type:", auction?.type);

    if (!auction) {
      // Try to find any store item with this ID to debug
      const anyItem = await getOne({
        col: "storeitems",
        data: { _id: auctionId },
      });
      console.log(
        "🔍 Any item with this ID:",
        !!anyItem,
        "type:",
        anyItem?.type
      );
      return { error: "Auction not found" };
    }

    // Check if auction is active
    if (auction.auctionStatus !== "active") {
      return { error: "Auction is not active" };
    }

    // Check if auction has ended
    const now = new Date();
    if (auction.auctionEndTime <= now) {
      return { error: "Auction has ended" };
    }

    // Check if user is not the auction owner
    if (auction.createdBy.toString() === mongoUser._id.toString()) {
      return { error: "You cannot bid on your own auction" };
    }

    // Check if bid amount is valid
    const currentHighestBid = auction.auctionCurrentBid?.amount || 0;
    const minimumBid = Math.max(
      auction.auctionStartPrice,
      currentHighestBid + auction.auctionMinBidIncrement
    );

    if (bidAmount < minimumBid) {
      return {
        error: `Minimum bid is $${minimumBid.toFixed(2)}`,
      };
    }

    // Check if there's a reserve price and if it's met
    if (
      auction.auctionReservePrice &&
      bidAmount < auction.auctionReservePrice
    ) {
      // Allow the bid but note that reserve is not met
      console.log(
        `Bid of $${bidAmount} is below reserve price of $${auction.auctionReservePrice}`
      );
    }

    // Create bid object
    const newBid = {
      bidderId: mongoUser._id,
      amount: bidAmount,
      bidTime: now,
      isWinning: true, // This will be the highest bid
    };

    // Update all previous bids to not winning
    const updatedBids = auction.auctionBids.map((bid) => ({
      ...bid,
      isWinning: false,
    }));

    // Add new bid
    updatedBids.push(newBid);

    // Update auction with new bid
    const updatedAuction = await update({
      col: "storeitems",
      data: { _id: auctionId },
      update: {
        auctionCurrentBid: {
          amount: bidAmount,
          bidderId: mongoUser._id,
          bidTime: now,
        },
        auctionBids: updatedBids,
      },
      skipOwnershipCheck: true, // System operation
    });

    if (updatedAuction?.error) {
      return { error: updatedAuction.error };
    }

    // Create outbid notifications for all previous bidders (for real-time notifications)
    try {
      console.log(`🔔 Creating outbid notifications for auction ${auctionId}`);

      // Get all unique previous bidders (excluding the new bidder)
      const previousBidders = new Set();
      auction.auctionBids.forEach((bid) => {
        if (bid.bidderId.toString() !== mongoUser._id.toString()) {
          previousBidders.add(bid.bidderId.toString());
        }
      });

      // Create outbid notifications for all previous bidders
      const outbidNotifications = [];
      for (const bidderId of previousBidders) {
        outbidNotifications.push({
          userId: bidderId,
          type: "auction_outbid",
          title: "You've Been Outbid",
          content: `Someone placed a higher bid of $${bidAmount.toFixed(
            2
          )} on "${auction.title}". Place a higher bid to stay in the running!`,
          sourceId: auctionId,
          sourceModel: "storeitems",
          sourceUserId: mongoUser._id,
          link: `/storeitems/${auctionId}`,
          read: false,
          // Add a flag to indicate this notification needs to be sent via socket
          needsSocketNotification: true,
        });
      }

      // Create notifications individually if there are any
      if (outbidNotifications.length > 0) {
        const createdNotifications = [];
        for (const notification of outbidNotifications) {
          try {
            const createdNotification = await add({
              col: "notifications",
              data: notification,
            });
            if (createdNotification && !createdNotification.error) {
              createdNotifications.push(createdNotification);
            }
          } catch (singleNotificationError) {
            console.error(
              "❌ Error creating single outbid notification:",
              singleNotificationError
            );
          }
        }

        console.log(
          `✅ Created ${createdNotifications.length} outbid notifications for auction ${auctionId}`
        );
      }
    } catch (notificationError) {
      console.error(
        "❌ Error creating outbid notifications:",
        notificationError
      );
      // Don't fail the bid process if notification creation fails
    }

    // Send email notifications to all auction participants
    try {
      console.log(
        `📧 Sending bid notification emails for auction ${auctionId}`
      );
      // Send notifications to:
      // 1. Auction owner (seller) - to inform about new bid activity
      // 2. All previous bidders - to inform they may have been outbid
      // Excludes the new bidder to avoid self-notification
      const emailResult = await sendAuctionNewBidNotificationToParticipants({
        auctionId,
        newBidAmount: bidAmount,
        newBidderId: mongoUser._id,
      });

      if (emailResult.error) {
        console.error(
          "❌ Failed to send bid notification emails:",
          emailResult.error
        );
        // Don't fail the bid process if email fails
      } else {
        console.log(
          `✅ Bid notification emails sent: ${emailResult.sentCount} successful, ${emailResult.failedCount} failed`
        );
      }
    } catch (emailError) {
      console.error("❌ Error sending bid notification emails:", emailError);
      // Don't fail the bid process if email fails
    }

    // Revalidate paths
    revalidatePath("/");
    revalidatePath(`/storeitems/${auctionId}`);

    return {
      success: true,
      bidAmount,
      isHighestBidder: true,
      auctionEndTime: auction.auctionEndTime,
      minimumNextBid: bidAmount + auction.auctionMinBidIncrement,
    };
  } catch (error) {
    console.error("❌ Error placing bid:", error);
    return { error: error.message || "Failed to place bid" };
  }
};

// Get auction details with bidding history
export const getAuctionDetails = async ({ auctionId }) => {
  try {
    const { mongoUser } = await getMongoUser();

    console.log("🔍 Getting auction details - auctionId:", auctionId);

    const auction = await getOne({
      col: "storeitems",
      data: { _id: auctionId, type: "auction" },
      populate: [
        {
          path: "files",
        },
        {
          path: "createdBy",
        },
        {
          path: "auctionBids.bidderId",
        },
        {
          path: "auctionCurrentBid.bidderId",
        },
        {
          path: "auctionWinnerId",
        },
      ],
    });

    console.log(
      "🔍 Auction details found:",
      !!auction,
      "auction type:",
      auction?.type
    );

    if (!auction) {
      // Try to find any store item with this ID to debug
      const anyItem = await getOne({
        col: "storeitems",
        data: { _id: auctionId },
      });
      console.log(
        "🔍 Any item with this ID:",
        !!anyItem,
        "type:",
        anyItem?.type
      );
      return { error: "Auction not found" };
    }

    // Calculate time remaining
    const now = new Date();
    const timeRemaining = Math.max(0, auction.auctionEndTime - now);

    // Determine if user is the highest bidder
    const isUserHighestBidder =
      mongoUser?._id &&
      auction.auctionCurrentBid?.bidderId?.toString() ===
        mongoUser._id.toString();

    // Calculate next minimum bid
    const currentBid = auction.auctionCurrentBid?.amount || 0;
    const minimumNextBid = Math.max(
      auction.auctionStartPrice,
      currentBid + auction.auctionMinBidIncrement
    );

    // Sort bids by amount (highest first) for display
    const sortedBids = [...auction.auctionBids].sort(
      (a, b) => b.amount - a.amount
    );

    // Check if reserve price is met (if exists)
    const reserveMet =
      !auction.auctionReservePrice || currentBid >= auction.auctionReservePrice;

    return {
      ...auction,
      timeRemaining,
      timeRemainingFormatted: formatTimeRemaining(timeRemaining),
      isUserHighestBidder,
      minimumNextBid,
      sortedBids,
      reserveMet,
      canBid:
        auction.auctionStatus === "active" &&
        timeRemaining > 0 &&
        (!mongoUser?._id ||
          auction.createdBy.toString() !== mongoUser._id.toString()),
    };
  } catch (error) {
    console.error("❌ Error getting auction details:", error);
    return { error: error.message || "Failed to get auction details" };
  }
};

// Get user's bidding history
export const getUserBiddingHistory = async () => {
  try {
    const { mongoUser } = await getMongoUser();
    if (!mongoUser?._id) {
      return { error: "User not authenticated" };
    }

    const auctions = await getAll({
      col: "storeitems",
      data: {
        type: "auction",
        "auctionBids.bidderId": mongoUser._id,
      },
      populate: [
        {
          path: "files",
        },
        {
          path: "createdBy",
        },
      ],
      sort: { "auctionBids.bidTime": -1 },
    });

    // Process each auction to show user's bid info
    const biddingHistory = auctions.map((auction) => {
      const userBids = auction.auctionBids.filter(
        (bid) => bid.bidderId.toString() === mongoUser._id.toString()
      );

      const highestUserBid = Math.max(...userBids.map((bid) => bid.amount));
      const isWinning =
        auction.auctionCurrentBid?.bidderId?.toString() ===
        mongoUser._id.toString();
      const hasWon =
        auction.auctionStatus === "ended" &&
        auction.auctionWinnerId?.toString() === mongoUser._id.toString();

      return {
        ...auction,
        userBids,
        highestUserBid,
        isWinning,
        hasWon,
        status: hasWon ? "won" : isWinning ? "winning" : "outbid",
      };
    });

    return biddingHistory;
  } catch (error) {
    console.error("❌ Error getting bidding history:", error);
    return { error: error.message || "Failed to get bidding history" };
  }
};

// Get auctions created by user
export const getUserAuctions = async () => {
  try {
    const { mongoUser } = await getMongoUser();
    if (!mongoUser?._id) {
      return { error: "User not authenticated" };
    }

    const auctions = await getAll({
      col: "storeitems",
      data: {
        type: "auction",
        createdBy: mongoUser._id,
      },
      populate: [
        {
          path: "files",
        },
        {
          path: "auctionCurrentBid.bidderId",
        },
        {
          path: "auctionWinnerId",
        },
      ],
      sort: { createdAt: -1 },
    });

    // Process each auction to show additional info
    const userAuctions = auctions.map((auction) => {
      const totalBids = auction.auctionBids.length;
      const currentBid = auction.auctionCurrentBid?.amount || 0;
      const timeRemaining = Math.max(0, auction.auctionEndTime - new Date());

      return {
        ...auction,
        totalBids,
        currentBid,
        timeRemaining,
        timeRemainingFormatted: formatTimeRemaining(timeRemaining),
      };
    });

    return userAuctions;
  } catch (error) {
    console.error("❌ Error getting user auctions:", error);
    return { error: error.message || "Failed to get user auctions" };
  }
};

// Prepare auction buy-now data for Stripe session creation
export const buyNowCreateStripeSession = async ({ auctionItemId }) => {
  try {
    const { mongoUser } = await getMongoUser();
    if (!mongoUser?._id) {
      return { error: "User not authenticated" };
    }

    console.log("🔍 Buy now create session - auctionItemId:", auctionItemId);

    // Get the auction item with populated creator info
    const auction = await getOne({
      col: "storeitems",
      data: { _id: auctionItemId, type: "auction" },
      populate: [
        {
          path: "createdBy",
        },
        {
          path: "files",
        },
      ],
    });

    if (!auction) {
      return { error: "Auction not found" };
    }

    // Check if buy now is available
    if (!auction.auctionBuyNowPrice) {
      return { error: "Buy now is not available for this auction" };
    }

    // Check if auction is still active
    if (auction.auctionStatus !== "active") {
      return { error: "Auction is not active" };
    }

    // Check if auction has ended
    const now = new Date();
    if (auction.auctionEndTime <= now) {
      return { error: "Auction has ended" };
    }

    // Check if user is not the auction owner
    if (auction.createdBy._id.toString() === mongoUser._id.toString()) {
      return { error: "You cannot buy your own auction" };
    }

    // Add dev status to the store owner
    const storeOwnerWithDevStatus = await addDevStatus(auction.createdBy);

    return {
      auctionItem: {
        ...auction,
        createdBy: storeOwnerWithDevStatus,
      },
      buyNowPrice: auction.auctionBuyNowPrice,
      success: true,
    };
  } catch (error) {
    console.error("❌ Error preparing buy-now session:", error);
    return { error: error.message || "Failed to prepare buy-now session" };
  }
};

// Complete buy-now purchase after successful Stripe payment
export const completeBuyNowAfterPayment = async ({
  auctionItemId,
  stripeSessionId,
}) => {
  try {
    const { mongoUser } = await getMongoUser();
    if (!mongoUser?._id) {
      return { error: "User not authenticated" };
    }

    console.log(
      "🔍 Complete buy-now after payment - auctionItemId:",
      auctionItemId
    );

    // Get the auction item
    const auction = await getOne({
      col: "storeitems",
      data: { _id: auctionItemId, type: "auction" },
    });

    if (!auction) {
      return { error: "Auction not found" };
    }

    // Check if auction is still active (hasn't been completed by another buy-now)
    if (auction.auctionStatus !== "active") {
      return { error: "Auction is no longer active" };
    }

    // End auction immediately and set winner
    const now = new Date();
    const buyNowBid = {
      bidderId: mongoUser._id,
      amount: auction.auctionBuyNowPrice,
      bidTime: now,
      isWinning: true,
      buyNow: true, // Mark this as a buy-now bid
    };

    // Update all previous bids to not winning
    const updatedBids = auction.auctionBids.map((bid) => ({
      ...bid,
      isWinning: false,
    }));

    // Add buy now bid
    updatedBids.push(buyNowBid);

    // Update auction - end it with winner
    const updatedAuction = await update({
      col: "storeitems",
      data: { _id: auctionItemId },
      update: {
        auctionStatus: "ended",
        auctionWinnerId: mongoUser._id,
        auctionCurrentBid: {
          amount: auction.auctionBuyNowPrice,
          bidderId: mongoUser._id,
          bidTime: now,
        },
        auctionBids: updatedBids,
        // Reduce stock by 1 since item is sold
        stock: Math.max(0, auction.stock - 1),
        // Add metadata about the payment
        metadata: {
          ...auction.metadata,
          buyNowCompleted: true,
          buyNowStripeSessionId: stripeSessionId,
          buyNowCompletedAt: now,
        },
      },
      skipOwnershipCheck: true, // System operation
    });

    if (updatedAuction?.error) {
      return { error: updatedAuction.error };
    }

    // Revalidate paths
    revalidatePath("/");
    revalidatePath(`/storeitems/${auctionItemId}`);

    return {
      success: true,
      boughtPrice: auction.auctionBuyNowPrice,
      message: "Auction won with Buy Now!",
      auction: updatedAuction,
    };
  } catch (error) {
    console.error("❌ Error completing buy-now after payment:", error);
    return {
      error: error.message || "Failed to complete buy-now after payment",
    };
  }
};

// Buy now (if buy now price is set)
export const buyNow = async ({ auctionId }) => {
  try {
    const { mongoUser } = await getMongoUser();
    if (!mongoUser?._id) {
      return { error: "User not authenticated" };
    }

    console.log("🔍 Buy now - auctionId:", auctionId);

    // Get the auction item
    const auction = await getOne({
      col: "storeitems",
      data: { _id: auctionId, type: "auction" },
    });

    console.log(
      "🔍 Buy now auction found:",
      !!auction,
      "auction type:",
      auction?.type
    );

    if (!auction) {
      // Try to find any store item with this ID to debug
      const anyItem = await getOne({
        col: "storeitems",
        data: { _id: auctionId },
      });
      console.log(
        "🔍 Any item with this ID:",
        !!anyItem,
        "type:",
        anyItem?.type
      );
      return { error: "Auction not found" };
    }

    // Check if buy now is available
    if (!auction.auctionBuyNowPrice) {
      return { error: "Buy now is not available for this auction" };
    }

    // Check if auction is still active
    if (auction.auctionStatus !== "active") {
      return { error: "Auction is not active" };
    }

    // Check if auction has ended
    const now = new Date();
    if (auction.auctionEndTime <= now) {
      return { error: "Auction has ended" };
    }

    // Check if user is not the auction owner
    if (auction.createdBy.toString() === mongoUser._id.toString()) {
      return { error: "You cannot buy your own auction" };
    }

    // End auction immediately and set winner
    const buyNowBid = {
      bidderId: mongoUser._id,
      amount: auction.auctionBuyNowPrice,
      bidTime: now,
      isWinning: true,
    };

    // Update all previous bids to not winning
    const updatedBids = auction.auctionBids.map((bid) => ({
      ...bid,
      isWinning: false,
    }));

    // Add buy now bid
    updatedBids.push(buyNowBid);

    // Update auction - end it with winner
    const updatedAuction = await update({
      col: "storeitems",
      data: { _id: auctionId },
      update: {
        auctionStatus: "ended",
        auctionWinnerId: mongoUser._id,
        auctionCurrentBid: {
          amount: auction.auctionBuyNowPrice,
          bidderId: mongoUser._id,
          bidTime: now,
        },
        auctionBids: updatedBids,
        // Reduce stock by 1 since item is sold
        stock: Math.max(0, auction.stock - 1),
      },
      skipOwnershipCheck: true, // System operation
    });

    if (updatedAuction?.error) {
      return { error: updatedAuction.error };
    }

    // Revalidate paths
    revalidatePath("/");
    revalidatePath(`/storeitems/${auctionId}`);

    return {
      success: true,
      boughtPrice: auction.auctionBuyNowPrice,
      message: "Auction won with Buy Now!",
    };
  } catch (error) {
    console.error("❌ Error buying now:", error);
    return { error: error.message || "Failed to buy now" };
  }
};

// Check if auction payment has been completed
export const checkAuctionPaymentStatus = async ({ auctionItemId }) => {
  try {
    const { mongoUser } = await getMongoUser();
    if (!mongoUser?._id) {
      return { error: "User not authenticated" };
    }

    // Check if there's already a paid order for this auction item by this user
    const existingOrder = await getOne({
      col: "storeitemsorders",
      data: {
        createdBy: mongoUser._id,
        "items.storeItemId": auctionItemId,
        paymentStatus: "paid",
        $or: [
          { "metadata.auctionWinnerPayment": true },
          { "metadata.auctionBuyNow": true },
        ],
      },
    });

    if (existingOrder) {
      return {
        isPaid: true,
        order: existingOrder,
        message: "Auction has already been paid for",
      };
    }

    return { isPaid: false };
  } catch (error) {
    console.error("❌ Error checking auction payment status:", error);
    return { error: error.message || "Failed to check payment status" };
  }
};

// Helper function to format time remaining
function formatTimeRemaining(milliseconds) {
  if (milliseconds <= 0) return "Ended";

  const totalSeconds = Math.floor(milliseconds / 1000);
  const days = Math.floor(totalSeconds / (24 * 3600));
  const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}
