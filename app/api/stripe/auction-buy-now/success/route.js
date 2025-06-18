import { NextResponse } from "next/server";
import Stripe from "stripe";
import { redirect } from "next/navigation";
import { completeBuyNowAfterPayment } from "@/lib/actions/auctionActions";
import { add } from "@/lib/actions/crud";
import { processStripeConnectTransfers } from "@/lib/actions/processStripeConnectTransfers";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      console.error("No session ID provided");
      return redirect("/");
    }

    // Get mongo user
    const { mongoUser } = await getMongoUser();
    if (!mongoUser?._id) {
      console.error("User not authenticated");
      return redirect("/");
    }

    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Verify session is valid and paid
    if (session.payment_status !== "paid") {
      console.error("Payment not completed:", session.payment_status);
      return redirect("/");
    }

    // Extract auction data from session metadata
    const {
      auctionItemId,
      storeOwnerId,
      buyNowPrice,
      platformFee,
      originalAmount,
      stripeAccount,
    } = session.metadata;

    if (!auctionItemId || !storeOwnerId || !buyNowPrice) {
      console.error("Missing required metadata in session");
      return redirect("/");
    }

    // Complete the auction buy now (end auction and set winner)
    const auctionResult = await completeBuyNowAfterPayment({
      auctionItemId,
      stripeSessionId: sessionId,
    });

    if (auctionResult.error) {
      console.error("Failed to complete auction:", auctionResult.error);
      // Even if auction completion fails, we need to create an order since payment was made
    }

    // Create order record for the auction purchase
    const orderData = {
      createdBy: mongoUser._id,
      storeOwner: storeOwnerId,
      items: [
        {
          storeItemId: auctionItemId,
          quantity: 1,
          priceAtTime: parseFloat(buyNowPrice),
          title: `Auction Item (Buy Now)`,
          category: "Auction",
          stockAtTime: 1, // Auction items are unique
        },
      ],
      subtotal: parseFloat(buyNowPrice),
      tax: 0,
      shipping: 0, // Auction items might not include shipping in buy-now price
      total: parseFloat(buyNowPrice),
      stripeSessionId: sessionId,
      stripePaymentIntentId: session.payment_intent,
      paymentStatus: "paid",
      orderStatus: "pending", // Start as pending for store owner to process
      // Note: No shipping address for auction buy-now (seller contacts winner separately)
      platformFee: parseFloat(platformFee) / 100 || 0, // Convert from cents
      transferAmount:
        (parseFloat(originalAmount) - parseFloat(platformFee)) / 100 || 0, // Convert from cents
      transferStatus: "pending",
      metadata: {
        auctionBuyNow: true,
        originalSessionId: sessionId,
      },
    };

    const order = await add({
      col: "storeitemsorders",
      data: orderData,
    });

    if (order.error) {
      console.error("Failed to create order:", order.error);
      // Don't fail the process, continue with transfer
    } else {
      console.log("Auction buy-now order created:", order._id);
    }

    // Process Stripe Connect transfer to store owner (if applicable)
    if (stripeAccount && order && !order.error) {
      try {
        await processStripeConnectTransfers([
          {
            orderId: order._id,
            storeOwnerId,
            stripeAccountId: stripeAccount,
            amount: parseFloat(originalAmount) - parseFloat(platformFee), // Amount in cents
            platformFee: parseFloat(platformFee), // Platform fee in cents
          },
        ]);

        console.log("Stripe Connect transfer initiated for auction buy-now");
      } catch (transferError) {
        console.error(
          "Transfer failed but payment was successful:",
          transferError
        );
        // Don't fail the success flow - transfers can be retried
      }
    }

    // Redirect to success page with order information
    const redirectUrl =
      order && !order.error
        ? `/orders?highlight=${order._id}&auction_success=true`
        : `/orders?auction_success=true`;

    return redirect(redirectUrl);
  } catch (error) {
    console.error("Auction buy-now success processing error:", error);
    // Redirect to orders page even on error - payment was successful
    return redirect("/orders?auction_success=true&error=processing");
  }
}
