const StoreItems = require("../models/StoreItemsModel");
const Notifications = require("../models/NotificationModel");
const SOCKET_EVENTS = require("../constants/socketEvents");

// * Monitors auction lifecycle: starting pending auctions, ending active auctions, determining winners
function startAuctionMonitor(io) {
  setInterval(async () => {
    try {
      const now = new Date();

      // 1. Start pending auctions that have reached their start time
      await startPendingAuctions(now, io);

      // 2. End active auctions that have reached their end time
      await endActiveAuctions(now, io);

      console.log(`Finished processing auctions at: ${new Date()}`);
    } catch (error) {
      console.error("❌ Error processing auctions:", error);
      io.emit(SOCKET_EVENTS.STORE.AUCTION.ERROR, {
        error: "Error processing auctions",
        timestamp: new Date(),
      });
    }
  }, 3000); // TODO ! NOT NOW ! Check every 30 seconds for more responsive auction updates
}

// Start auctions that have reached their start time
async function startPendingAuctions(now, io) {
  try {
    const pendingAuctions = await StoreItems.find({
      type: "auction",
      auctionStatus: "pending",
      auctionStartTime: { $lte: now },
    });

    for (const auction of pendingAuctions) {
      // Update auction status to active
      const updatedAuction = await StoreItems.findByIdAndUpdate(
        auction._id,
        {
          auctionStatus: "active",
        },
        { new: true }
      );

      console.log(`🟢 Started auction: ${auction._id} - ${auction.title}`);

      // Notify clients that auction has started
      io.emit(SOCKET_EVENTS.STORE.AUCTION.STARTED, {
        auctionId: auction._id.toString(),
        title: auction.title,
        auctionStartPrice: auction.auctionStartPrice,
        auctionEndTime: auction.auctionEndTime,
        createdBy: auction.createdBy,
        timestamp: now,
      });

      // Emit updated auction data to interested clients
      io.emit(SOCKET_EVENTS.STORE.AUCTION.UPDATED, {
        auctionId: auction._id.toString(),
        auctionStatus: "active",
        timestamp: now,
      });
    }

    if (pendingAuctions.length > 0) {
      console.log(`✅ Started ${pendingAuctions.length} auctions`);
    }
  } catch (error) {
    console.error("❌ Error starting pending auctions:", error);
    throw error;
  }
}

// End auctions that have reached their end time
async function endActiveAuctions(now, io) {
  try {
    const endedAuctions = await StoreItems.find({
      type: "auction",
      auctionStatus: "active",
      auctionEndTime: { $lte: now },
    });

    for (const auction of endedAuctions) {
      let winner = null;
      let winningAmount = 0;

      // Determine winner from current bid
      if (auction.auctionCurrentBid && auction.auctionCurrentBid.bidderId) {
        winner = auction.auctionCurrentBid.bidderId;
        winningAmount = auction.auctionCurrentBid.amount;

        // Update all bids to mark the winning one
        const updatedBids = auction.auctionBids.map((bid) => ({
          ...bid,
          isWinning:
            bid.bidderId.toString() === winner.toString() &&
            bid.amount === winningAmount,
        }));

        // Update auction with winner info
        await StoreItems.findByIdAndUpdate(
          auction._id,
          {
            auctionStatus: "ended",
            auctionWinnerId: winner,
            auctionBids: updatedBids,
            // Reduce stock by 1 since auction item is sold
            stock: Math.max(0, auction.stock - 1),
          },
          { new: true }
        );

        console.log(
          `🏆 Auction ended with winner: ${auction._id} - Winner: ${winner} - Amount: $${winningAmount}`
        );

        // Send general notification broadcast about auction end
        io.emit(SOCKET_EVENTS.NOTIFICATION.NEW, {
          type: "auction_ended_with_winner",
          title: `Auction ended: ${auction.title}`,
          content: `The auction for "${auction.title}" has ended with a winning bid of $${winningAmount}.`,
          auctionId: auction._id.toString(),
          winnerId: winner.toString(),
          sellerId: auction.createdBy.toString(),
          timestamp: now,
        });

        // Create database notification for winner
        await createDatabaseNotification({
          userId: winner,
          type: "auction_won",
          title: `Congratulations! You won the auction`,
          content: `You won the auction for "${auction.title}" with a bid of $${winningAmount}. Click here to complete your payment and secure your purchase.`,
          sourceId: auction._id,
          sourceUserId: auction.createdBy,
          link: `/auction-payment/${auction._id}`,
        });

        // Create database notification for seller
        await createDatabaseNotification({
          userId: auction.createdBy,
          type: "auction_sold",
          title: `Your auction has sold!`,
          content: `Your auction for "${auction.title}" has ended with a winning bid of $${winningAmount}. The buyer will proceed to checkout.`,
          sourceId: auction._id,
          sourceUserId: winner,
          link: `/storeitems/${auction._id}`,
        });

        // Send targeted socket notification to winner
        console.log(
          `🔔 Sending winner notification to user: ${winner.toString()}`
        );
        io.emit(SOCKET_EVENTS.NOTIFICATION.USER(winner.toString()), {
          type: "auction_won",
          title: `Congratulations! You won the auction`,
          content: `You won the auction for "${auction.title}" with a bid of $${winningAmount}. Please proceed to checkout to complete your purchase.`,
          auctionId: auction._id.toString(),
          timestamp: now,
        });

        // Send targeted socket notification to seller
        console.log(
          `🔔 Sending seller notification to user: ${auction.createdBy.toString()}`
        );
        io.emit(SOCKET_EVENTS.NOTIFICATION.USER(auction.createdBy.toString()), {
          type: "auction_sold",
          title: `Your auction has sold!`,
          content: `Your auction for "${auction.title}" has ended with a winning bid of $${winningAmount}. The buyer will proceed to checkout.`,
          auctionId: auction._id.toString(),
          timestamp: now,
        });

        // Notify winner (general auction event)
        io.emit(SOCKET_EVENTS.STORE.AUCTION.WON, {
          auctionId: auction._id.toString(),
          winnerId: winner.toString(),
          winningAmount: winningAmount,
          title: auction.title,
          createdBy: auction.createdBy,
          timestamp: now,
        });

        // Notify auction owner about successful sale (general auction event)
        io.emit(SOCKET_EVENTS.STORE.AUCTION.SOLD, {
          auctionId: auction._id.toString(),
          sellerId: auction.createdBy.toString(),
          winnerId: winner.toString(),
          winningAmount: winningAmount,
          title: auction.title,
          timestamp: now,
        });

        // Notify all bidders about auction end (excluding winner who got their own notification)
        await notifyBidders(auction, io, "auction_ended", {
          message: `The auction was won by another bidder with $${winningAmount}.`,
          winningAmount: winningAmount,
          winnerId: winner.toString(),
        });
      } else {
        // No bids - auction ended without winner
        await StoreItems.findByIdAndUpdate(
          auction._id,
          {
            auctionStatus: "ended",
          },
          { new: true }
        );

        console.log(
          `📝 Auction ended without bids: ${auction._id} - ${auction.title}`
        );

        // Create database notification for seller (no bids)
        await createDatabaseNotification({
          userId: auction.createdBy,
          type: "auction_ended",
          title: `Your auction has ended`,
          content: `Your auction for "${auction.title}" has ended without any bids. You may want to consider relisting it with a lower starting price.`,
          sourceId: auction._id,
          sourceUserId: auction.createdBy,
          link: `/storeitems/${auction._id}`,
        });

        // Send targeted socket notification to seller (no bids)
        io.emit(SOCKET_EVENTS.NOTIFICATION.USER(auction.createdBy.toString()), {
          type: "auction_ended",
          title: `Your auction has ended`,
          content: `Your auction for "${auction.title}" has ended without any bids. You may want to consider relisting it with a lower starting price.`,
          auctionId: auction._id.toString(),
          timestamp: now,
        });

        // Notify auction owner about auction ending without bids (general auction event)
        io.emit(SOCKET_EVENTS.STORE.AUCTION.ENDED_NO_BIDS, {
          auctionId: auction._id.toString(),
          sellerId: auction.createdBy.toString(),
          title: auction.title,
          timestamp: now,
        });
      }

      // Notify all clients that auction has ended
      io.emit(SOCKET_EVENTS.STORE.AUCTION.ENDED, {
        auctionId: auction._id.toString(),
        title: auction.title,
        winnerId: winner ? winner.toString() : null,
        winningAmount: winningAmount,
        hadBids: !!winner,
        timestamp: now,
      });

      // Emit updated auction data to interested clients
      io.emit(SOCKET_EVENTS.STORE.AUCTION.UPDATED, {
        auctionId: auction._id.toString(),
        auctionStatus: "ended",
        auctionWinnerId: winner ? winner.toString() : null,
        winningAmount: winningAmount,
        timestamp: now,
      });
    }

    if (endedAuctions.length > 0) {
      console.log(`✅ Ended ${endedAuctions.length} auctions`);
    }
  } catch (error) {
    console.error("❌ Error ending active auctions:", error);
    throw error;
  }
}

// Helper function to create database notification
async function createDatabaseNotification({
  userId,
  type,
  title,
  content,
  sourceId,
  sourceModel = "storeitems",
  sourceUserId,
  link = "",
}) {
  try {
    console.log(
      `📝 Creating database notification for user ${userId}, type: ${type}`
    );
    const notification = new Notifications({
      userId,
      type,
      title,
      content,
      sourceId,
      sourceModel,
      sourceUserId,
      link,
    });
    const savedNotification = await notification.save();
    console.log(
      `✅ Database notification created for user ${userId} with ID: ${savedNotification._id}`
    );
    return savedNotification;
  } catch (error) {
    console.error("❌ Error creating database notification:", error);
    console.error("❌ Notification data:", {
      userId,
      type,
      title,
      content,
      sourceId,
      sourceModel,
      sourceUserId,
      link,
    });
    return null;
  }
}

// Helper function to notify bidders about auction status
async function notifyBidders(auction, io, eventType, additionalData = {}) {
  try {
    const bidderIds = [
      ...new Set(auction.auctionBids.map((bid) => bid.bidderId.toString())),
    ];

    // Exclude winner from general bidder notifications to avoid duplicates
    const winnerId = additionalData.winnerId;
    const biddersToNotify = winnerId
      ? bidderIds.filter((bidderId) => bidderId !== winnerId)
      : bidderIds;

    for (const bidderId of biddersToNotify) {
      // Send targeted socket notification to specific bidder
      io.emit(SOCKET_EVENTS.NOTIFICATION.USER(bidderId), {
        type: "auction_ended",
        title: `Auction ended: ${auction.title}`,
        content: `The auction for "${auction.title}" has ended. ${
          additionalData.message || ""
        }`,
        auctionId: auction._id.toString(),
        timestamp: new Date(),
      });

      // Send general socket notification
      io.emit(SOCKET_EVENTS.STORE.AUCTION.BIDDER_NOTIFICATION, {
        bidderId: bidderId,
        auctionId: auction._id.toString(),
        eventType: eventType,
        title: auction.title,
        ...additionalData,
        timestamp: new Date(),
      });

      // Create database notification for persistent storage
      await createDatabaseNotification({
        userId: bidderId,
        type: "auction_ended",
        title: `Auction ended: ${auction.title}`,
        content: `The auction for "${auction.title}" has ended. ${
          additionalData.message || ""
        }`,
        sourceId: auction._id,
        sourceUserId: auction.createdBy,
        link: `/storeitems/${auction._id}`,
      });
    }

    console.log(
      `✅ Notified ${biddersToNotify.length} bidders about auction ${auction._id}`
    );
  } catch (error) {
    console.error("❌ Error notifying bidders:", error);
  }
}

module.exports = startAuctionMonitor;
