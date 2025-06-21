const StoreItems = require("../models/StoreItemsModel");
const StoreItemsOrder = require("../models/StoreItemsOrderModel");
const User = require("../models/UserModel");
const SOCKET_EVENTS = require("../constants/socketEvents");

// * Monitor if auction winners purchased their won items within 7 days
function startAuctionPurchaseMonitor(io) {
  setInterval(async () => {
    try {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
      // const sevenDaysAgo = new Date(now.getTime() + 1000); // TODO ! NOT NOW !

      console.log(
        `🔍 Checking for unpurchased auction items that ended before: ${sevenDaysAgo}`
      );

      // Find all ended auctions that ended more than 7 days ago and have winners
      const endedAuctions = await StoreItems.find({
        type: "auction",
        auctionStatus: "ended",
        auctionWinnerId: { $exists: true, $ne: null },
        auctionEndTime: { $lte: sevenDaysAgo }, // Ended more than 7 days ago
      });

      console.log(
        `📋 Found ${endedAuctions.length} auctions to check for purchase compliance`
      );

      for (const auction of endedAuctions) {
        try {
          // Get the winner user details separately
          const winnerUser = await User.findById(auction.auctionWinnerId);

          if (!winnerUser) {
            console.log(
              `⏭️ Skipping auction ${auction._id} - winner user not found`
            );
            continue;
          }

          // Check if the winner has already been restricted for auctions
          if (!winnerUser.auctionBidAllowed) {
            console.log(
              `⏭️ Skipping auction ${auction._id} - winner already restricted`
            );
            continue;
          }

          // Check if there's a paid order for this auction item by the winner
          const paidOrder = await StoreItemsOrder.findOne({
            createdBy: auction.auctionWinnerId,
            "items.storeItemId": auction._id,
            paymentStatus: "paid",
            $or: [
              { "metadata.auctionWinnerPayment": true },
              { "metadata.auctionBuyNow": true },
            ],
          });

          if (paidOrder) {
            console.log(
              `✅ Auction ${auction._id} - Winner ${
                winnerUser.username || "Unknown"
              } has paid for the item`
            );
            continue; // Winner has paid, no action needed
          }

          // Winner hasn't paid within 7 days - restrict their bidding privileges
          console.log(
            `❌ Auction ${auction._id} - Winner ${
              winnerUser.username || "Unknown"
            } hasn't paid within 7 days. Restricting bidding privileges.`
          );

          await User.findByIdAndUpdate(auction.auctionWinnerId, {
            auctionBidAllowed: false,
            auctionBidRestrictedAt: now,
            auctionBidRestrictedReason: `Failed to purchase won auction item within 7 days (Auction ID: ${auction._id})`,
          });

          // Emit notification to the user if they're online
          if (io) {
            io.emit(
              SOCKET_EVENTS.STORE.AUCTION.BID_RESTRICTED(
                auction.auctionWinnerId
              ),
              {
                type: "auction_bid_restricted",
                message:
                  "Your bidding privileges have been restricted due to not purchasing a won auction item within 7 days.",
                auctionId: auction._id,
                restrictedAt: now,
              }
            );
          }

          console.log(
            `🚫 User ${winnerUser.username || "Unknown"} (${
              auction.auctionWinnerId
            }) has been restricted from bidding`
          );
        } catch (auctionError) {
          console.error(
            `❌ Error processing auction ${auction._id}:`,
            auctionError
          );
        }
      }

      console.log(
        `✅ Finished checking auction purchase compliance at: ${new Date()}`
      );
    } catch (error) {
      console.error("❌ Error in auction purchase monitoring:", error);
      if (io) {
        io.emit(SOCKET_EVENTS.STORE.AUCTION.MONITOR_ERROR, {
          error: "Error monitoring auction purchases",
          timestamp: new Date(),
        });
      }
    }
  }, 3000); // TODO ! NOT NOW ! Check every 24 hours
}

module.exports = startAuctionPurchaseMonitor;
