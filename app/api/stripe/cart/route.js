import { NextResponse } from "next/server";
import Stripe from "stripe";
import { processCartItems } from "@/lib/actions/processCartItems";

export async function POST(request) {
  try {
    // Process cart items and prepare order data
    const cartResult = await processCartItems();

    if (cartResult.error) {
      console.error("Cart processing error:", cartResult.error);
      return NextResponse.json({ error: cartResult.error }, { status: 400 });
    }

    const { allLineItems, cartItems, itemsByStoreOwner, mongoUser } =
      cartResult;

    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Construct proper URLs with protocol
    const baseUrl =
      process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:3000";
    const successUrl = baseUrl.startsWith("http")
      ? `${baseUrl}/api/stripe/cart/success?session_id={CHECKOUT_SESSION_ID}`
      : `https://${baseUrl}/api/stripe/cart/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = baseUrl.startsWith("http")
      ? `${baseUrl}/cart`
      : `https://${baseUrl}/cart`;

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: allLineItems,
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: mongoUser.email,
      metadata: {
        userId: mongoUser._id.toString(),
        type: "cart_checkout",
        cartItemIds: cartItems.map((item) => item._id.toString()).join(","),
        storeOwnerIds: Object.keys(itemsByStoreOwner).join(","),
      },
      shipping_address_collection: {
        allowed_countries: [
          "US",
          "CA",
          "GB",
          "AU",
          "DE",
          "FR",
          "IT",
          "ES",
          "NL",
          "BE",
        ],
      },
      billing_address_collection: "required",
    });

    console.log("Stripe session created:", session.id);
    console.log(
      "Shippo shipment creation will be handled in success route after payment confirmation"
    );

    return NextResponse.json({
      sessionUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Cart checkout error:", error);
    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
