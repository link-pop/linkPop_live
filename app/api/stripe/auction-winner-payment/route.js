import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getOne } from "@/lib/actions/crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import { checkAuctionPaymentStatus } from "@/lib/actions/auctionActions";

export async function POST(request) {
  try {
    // Parse request body for auction item ID and shipping info
    const body = await request.json();
    const {
      auctionItemId,
      shippingAddress,
      shippingCost,
      selectedShippingRate,
    } = body;

    if (!auctionItemId) {
      return NextResponse.json(
        { error: "Auction item ID is required" },
        { status: 400 }
      );
    }

    if (!shippingAddress) {
      return NextResponse.json(
        { error: "Shipping address is required" },
        { status: 400 }
      );
    }

    if (!shippingCost || shippingCost <= 0) {
      return NextResponse.json(
        { error: "Shipping cost is required" },
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

    console.log(
      "🏆 Winner payment request for auction:",
      auctionItemId,
      "by user:",
      mongoUser._id
    );

    // Get the auction item with full population
    const auctionItem = await getOne({
      col: "storeitems",
      data: { _id: auctionItemId, type: "auction" },
      populate: [
        {
          path: "files",
        },
        "createdBy",
      ],
    });

    if (!auctionItem) {
      return NextResponse.json({ error: "Auction not found" }, { status: 404 });
    }

    // Validate this is a winner payment scenario
    if (auctionItem.auctionStatus !== "ended") {
      return NextResponse.json(
        { error: "This auction has not ended yet" },
        { status: 400 }
      );
    }

    if (!auctionItem.auctionWinnerId) {
      return NextResponse.json(
        { error: "This auction ended without a winner" },
        { status: 400 }
      );
    }

    if (auctionItem.auctionWinnerId.toString() !== mongoUser._id.toString()) {
      return NextResponse.json(
        { error: "You are not the winner of this auction" },
        { status: 403 }
      );
    }

    // Check if auction has already been paid for
    const paymentStatus = await checkAuctionPaymentStatus({ auctionItemId });
    if (paymentStatus.error) {
      return NextResponse.json({ error: paymentStatus.error }, { status: 400 });
    }

    if (paymentStatus.isPaid) {
      console.log(
        "🚫 Winner payment blocked - auction already paid:",
        auctionItemId,
        "by user:",
        mongoUser._id,
        "existing order:",
        paymentStatus.order?._id
      );
      return NextResponse.json(
        {
          error: "Auction has already been paid for",
          orderId: paymentStatus.order?._id,
        },
        { status: 400 }
      );
    }

    // Get the winning amount
    const winningAmount = auctionItem.auctionCurrentBid?.amount || 0;
    if (winningAmount <= 0) {
      return NextResponse.json(
        { error: "Invalid winning amount" },
        { status: 400 }
      );
    }

    // Calculate total with shipping
    const totalAmount = winningAmount + shippingCost;

    // Extract store owner from auction item
    const storeOwner = auctionItem.createdBy;

    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Construct proper URLs with protocol
    const baseUrl =
      process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:3000";
    const successUrl = baseUrl.startsWith("http")
      ? `${baseUrl}/api/stripe/auction-winner-payment/success?session_id={CHECKOUT_SESSION_ID}`
      : `https://${baseUrl}/api/stripe/auction-winner-payment/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = baseUrl.startsWith("http")
      ? `${baseUrl}/auction-payment/${auctionItemId}`
      : `https://${baseUrl}/auction-payment/${auctionItemId}`;

    // Calculate platform fee (20%) on item price only, not shipping
    const PLATFORM_FEE_PERCENTAGE = 0.2;
    const winningAmountCents = Math.round(winningAmount * 100); // Convert to cents
    const shippingCostCents = Math.round(shippingCost * 100); // Convert to cents
    const totalAmountCents = winningAmountCents + shippingCostCents;
    const platformFee = Math.round(
      winningAmountCents * PLATFORM_FEE_PERCENTAGE
    ); // Platform fee only on item, not shipping

    // Create line items for the auction item and shipping
    const lineItems = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Auction Won: ${auctionItem.title || "Auction Item"}`,
            description: `Payment for winning auction item${
              auctionItem.category ? ` • Category: ${auctionItem.category}` : ""
            } • Winning Bid: $${winningAmount}`,
            // Add auction images if available
            images:
              auctionItem.files
                ?.filter((file) => file.fileType === "image")
                .slice(0, 8) // Stripe allows max 8 images
                .map((file) => file.fileUrl) || [],
          },
          unit_amount: winningAmountCents,
        },
        quantity: 1,
      },
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Shipping",
            description: `Shipping via ${
              selectedShippingRate?.servicelevel?.name ||
              selectedShippingRate?.provider ||
              "Standard"
            }${
              selectedShippingRate?.estimated_days
                ? ` • ${selectedShippingRate.estimated_days} business days`
                : ""
            }`,
          },
          unit_amount: shippingCostCents,
        },
        quantity: 1,
      },
    ];

    // Create Stripe checkout session with Connect integration
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: mongoUser.email,
      metadata: {
        userId: mongoUser._id.toString(),
        type: "auction_winner_payment",
        auctionItemId: auctionItemId,
        storeOwnerId: storeOwner._id?.toString() || storeOwner.toString(),
        winningAmount: winningAmount.toString(),
        shippingCost: shippingCost.toString(),
        totalAmount: totalAmount.toString(),
        platformFeePercentage: (PLATFORM_FEE_PERCENTAGE * 100).toString(),
        platformFee: platformFee.toString(),
        originalAmount: totalAmountCents.toString(),
        shippingAddress: JSON.stringify(shippingAddress),
        shippingRate: JSON.stringify(selectedShippingRate),
        // Add store owner Stripe account if not dev
        ...(storeOwner.isDev || !storeOwner.stripeConnect?.accountId
          ? {}
          : { stripeAccount: storeOwner.stripeConnect.accountId }),
      },
    });

    console.log(
      "🏆 Auction winner payment Stripe session created:",
      session.id
    );
    console.log("Auction item:", auctionItemId);
    console.log("Winning amount:", winningAmount);
    console.log("Shipping cost:", shippingCost);
    console.log("Total amount:", totalAmount);
    console.log("Platform fee:", platformFee / 100, "USD");

    return NextResponse.json({
      sessionUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("❌ Auction winner payment checkout error:", error);
    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
