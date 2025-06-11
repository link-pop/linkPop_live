import { NextResponse } from "next/server";
import Stripe from "stripe";
import { processCartItems } from "@/lib/actions/processCartItems";
import { isStripeConnectReadyIncludingDevBypass } from "@/lib/utils/stripe/stripeConnectHelpers";

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

    // Validate that all store owners have completed Stripe Connect onboarding (or are devs)
    const storeOwnerIds = Object.keys(itemsByStoreOwner);
    const invalidStoreOwners = [];

    for (const storeOwnerId of storeOwnerIds) {
      const storeOwner = itemsByStoreOwner[storeOwnerId].storeOwner;

      // Use dev bypass logic to check if store owner can receive payments
      if (!isStripeConnectReadyIncludingDevBypass(storeOwner)) {
        invalidStoreOwners.push(
          storeOwner.username || storeOwner.email || "Unknown Store Owner"
        );
      }
    }

    if (invalidStoreOwners.length > 0) {
      return NextResponse.json(
        {
          error: "Some store owners haven't completed Stripe Connect setup",
          details: `The following store owners need to complete their payment setup: ${invalidStoreOwners.join(
            ", "
          )}`,
          invalidStoreOwners,
        },
        { status: 400 }
      );
    }

    // Calculate platform fee (20%)
    const PLATFORM_FEE_PERCENTAGE = 0.2;

    // Prepare line items without metadata (Stripe doesn't allow metadata on price_data)
    const lineItemsWithFees = allLineItems.map((lineItem) => {
      return {
        ...lineItem,
        // Remove metadata from price_data as it's not allowed by Stripe
      };
    });

    // Prepare detailed metadata for session level
    const storeOwnerMetadata = {};
    const itemMetadata = {};

    cartItems.forEach((cartItem, index) => {
      const storeOwner = cartItem.storeOwner;
      const lineItem = allLineItems[index];
      const itemTotal = lineItem.price_data.unit_amount * lineItem.quantity;
      const platformFee = Math.round(itemTotal * PLATFORM_FEE_PERCENTAGE);

      // Store owner info
      storeOwnerMetadata[`storeOwner_${index}`] = storeOwner._id.toString();
      // Only add stripe account for non-dev users who have actual accounts
      if (!storeOwner.isDev && storeOwner.stripeConnect?.accountId) {
        storeOwnerMetadata[`stripeAccount_${index}`] =
          storeOwner.stripeConnect.accountId;
      }

      // Item fee info
      itemMetadata[`item_${index}_platformFee`] = platformFee.toString();
      itemMetadata[`item_${index}_originalAmount`] = itemTotal.toString();
      itemMetadata[`item_${index}_storeItemId`] =
        cartItem.storeItemId._id.toString();
    });

    // Create Stripe checkout session with Connect integration
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItemsWithFees,
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: mongoUser.email,
      metadata: {
        userId: mongoUser._id.toString(),
        type: "cart_checkout_connect",
        cartItemIds: cartItems.map((item) => item._id.toString()).join(","),
        storeOwnerIds: storeOwnerIds.join(","),
        platformFeePercentage: (PLATFORM_FEE_PERCENTAGE * 100).toString(),
        // Add store owner and item metadata
        ...storeOwnerMetadata,
        ...itemMetadata,
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
      // Note: We'll handle the Connect transfers in the success webhook
      // since Stripe Checkout doesn't directly support destination charges
      // with multiple destinations in a single session
    });

    console.log("Stripe Connect session created:", session.id);
    console.log("Store owners involved:", storeOwnerIds.length);
    console.log(
      "Platform fee percentage:",
      PLATFORM_FEE_PERCENTAGE * 100 + "%"
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
