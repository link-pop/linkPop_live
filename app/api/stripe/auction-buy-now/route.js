import { NextResponse } from "next/server";
import Stripe from "stripe";
import { buyNowCreateStripeSession } from "@/lib/actions/auctionActions";
import { isStripeConnectReadyIncludingDevBypass } from "@/lib/utils/stripe/stripeConnectHelpers";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";

export async function POST(request) {
  try {
    // Parse request body for auction item ID
    const body = await request.json();
    const { auctionItemId } = body;

    if (!auctionItemId) {
      return NextResponse.json(
        { error: "Auction item ID is required" },
        { status: 400 }
      );
    }

    // Get mongo user
    const { mongoUser } = await getMongoUser();
    if (!mongoUser?._id) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Validate auction and prepare for purchase
    const auctionResult = await buyNowCreateStripeSession({ auctionItemId });

    if (auctionResult.error) {
      console.error("Auction validation error:", auctionResult.error);
      return NextResponse.json({ error: auctionResult.error }, { status: 400 });
    }

    const { auctionItem, buyNowPrice } = auctionResult;

    // Extract store owner from auction item
    const storeOwner = auctionItem.createdBy;

    // Debug logging for Stripe Connect check
    console.log("Auction buy-now Stripe Connect check:", {
      storeOwnerId: storeOwner?._id,
      isDev: storeOwner?.isDev,
      hasStripeConnect: Boolean(storeOwner?.stripeConnect?.accountId),
      stripeConnectReady: isStripeConnectReadyIncludingDevBypass(storeOwner),
    });

    // Check if store owner has completed Stripe Connect onboarding (or is dev)
    // This uses the same logic as the cart route with proper dev bypass
    if (!isStripeConnectReadyIncludingDevBypass(storeOwner)) {
      console.error("Stripe Connect check failed for store owner:", storeOwner);

      return NextResponse.json(
        {
          error: "Store owner hasn't completed Stripe Connect setup",
          details:
            "The seller needs to complete their payment setup before you can purchase this item.",
        },
        { status: 400 }
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Construct proper URLs with protocol
    const baseUrl =
      process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:3000";
    const successUrl = baseUrl.startsWith("http")
      ? `${baseUrl}/api/stripe/auction-buy-now/success?session_id={CHECKOUT_SESSION_ID}`
      : `https://${baseUrl}/api/stripe/auction-buy-now/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = baseUrl.startsWith("http")
      ? `${baseUrl}/storeitems/${auctionItemId}`
      : `https://${baseUrl}/storeitems/${auctionItemId}`;

    // Calculate platform fee (20%)
    const PLATFORM_FEE_PERCENTAGE = 0.2;
    const buyNowAmount = Math.round(buyNowPrice * 100); // Convert to cents
    const platformFee = Math.round(buyNowAmount * PLATFORM_FEE_PERCENTAGE);

    // Create line item for the auction item
    const lineItem = {
      price_data: {
        currency: "usd",
        product_data: {
          name: `Auction: ${auctionItem.title || "Auction Item"}`,
          description: `Buy now price for auction item${
            auctionItem.category ? ` • Category: ${auctionItem.category}` : ""
          }`,
          // Add auction images if available
          images:
            auctionItem.files
              ?.filter((file) => file.fileType === "image")
              .slice(0, 8) // Stripe allows max 8 images
              .map((file) => file.fileUrl) || [],
        },
        unit_amount: buyNowAmount,
      },
      quantity: 1,
    };

    // Create Stripe checkout session with Connect integration
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [lineItem],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: mongoUser.email,
      metadata: {
        userId: mongoUser._id.toString(),
        type: "auction_buy_now",
        auctionItemId: auctionItemId,
        storeOwnerId: storeOwner._id?.toString() || storeOwner.toString(),
        buyNowPrice: buyNowPrice.toString(),
        platformFeePercentage: (PLATFORM_FEE_PERCENTAGE * 100).toString(),
        platformFee: platformFee.toString(),
        originalAmount: buyNowAmount.toString(),
        // Add store owner Stripe account if not dev
        ...(storeOwner.isDev || !storeOwner.stripeConnect?.accountId
          ? {}
          : { stripeAccount: storeOwner.stripeConnect.accountId }),
      },
    });

    console.log("Auction buy-now Stripe session created:", session.id);
    console.log("Auction item:", auctionItemId);
    console.log("Buy now price:", buyNowPrice);
    console.log("Platform fee:", platformFee / 100, "USD");

    return NextResponse.json({
      sessionUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Auction buy-now checkout error:", error);
    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
