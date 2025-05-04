import { NextResponse } from "next/server";
import Stripe from "stripe";
import { models } from "@/lib/db/models/models";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      console.error("Session ID is required");
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Verify Stripe key is available
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("Missing STRIPE_SECRET_KEY environment variable");
      return NextResponse.json(
        { error: "Payment service configuration error" },
        { status: 500 }
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log("Retrieved Stripe session:", sessionId);

    if (session.payment_status !== "paid") {
      console.error("Payment not completed for session:", sessionId);
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 }
      );
    }

    const { postId, userId, purchaseId, chatRoomId } = session.metadata;
    console.log("Session metadata:", {
      postId,
      userId,
      purchaseId,
      chatRoomId,
    });

    // Update the purchase record
    try {
      const updatedPurchase = await models.purchases.findOneAndUpdate(
        { stripeSessionId: sessionId },
        { status: "completed" },
        { new: true }
      );

      if (!updatedPurchase) {
        console.error("Failed to find purchase record for session:", sessionId);

        // Try to find by purchaseId from metadata as fallback
        if (purchaseId) {
          const updatedByPurchaseId = await models.purchases.findByIdAndUpdate(
            purchaseId,
            {
              status: "completed",
              stripeSessionId: sessionId,
            },
            { new: true }
          );

          if (updatedByPurchaseId) {
            console.log(
              "Updated purchase record using purchaseId:",
              purchaseId
            );
          } else {
            console.error(
              "Failed to find purchase record by purchaseId:",
              purchaseId
            );
          }
        }
      } else {
        console.log("Updated purchase record:", updatedPurchase._id);
      }
    } catch (updateError) {
      console.error("Error updating purchase record:", updateError.message);
      // Continue with the redirect even if the update fails
    }

    // Determine base URL for redirect
    const baseUrl =
      process.env.NEXT_PUBLIC_CLIENT_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    // Redirect to the chat room
    const redirectUrl = chatRoomId
      ? `${baseUrl}/chatrooms/${chatRoomId}`
      : `${baseUrl}/chat`;

    console.log("Redirecting to:", redirectUrl);

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error(
      "Error processing successful payment:",
      error.message,
      error.stack
    );
    return NextResponse.json(
      { error: "Error processing successful payment", details: error.message },
      { status: 500 }
    );
  }
}
