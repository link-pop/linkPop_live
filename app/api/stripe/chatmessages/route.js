import { NextResponse } from "next/server";
import Stripe from "stripe";
import { models } from "@/lib/db/models/models";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";

export async function POST(req) {
  try {
    // Get the authenticated user
    const { mongoUser } = await getMongoUser();
    if (!mongoUser) {
      console.error("User not authenticated");
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    console.log("Authenticated user:", mongoUser._id);

    // Parse request body
    const body = await req.json();
    console.log("Request body:", JSON.stringify(body));

    const { messageId } = body;

    if (!messageId) {
      console.error("Message ID is required");
      return NextResponse.json(
        { error: "Message ID is required" },
        { status: 400 }
      );
    }

    // Get the message to determine the price
    const message = await models.chatmessages.findById(messageId);
    if (!message) {
      console.error("Message not found:", messageId);
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    if (!message.price || message.price <= 0) {
      console.error("Message does not require payment:", messageId);
      return NextResponse.json(
        { error: "This message does not require payment" },
        { status: 400 }
      );
    }

    // Check if user already purchased this message with completed status
    const existingCompletedPurchase = await models.purchases.findOne({
      userId: mongoUser._id,
      postId: message._id,
      postType: "chatmessages",
      status: "completed",
    });

    if (existingCompletedPurchase) {
      console.error(
        "User already purchased this content:",
        mongoUser._id,
        messageId
      );
      return NextResponse.json(
        { error: "You have already purchased this content" },
        { status: 400 }
      );
    }

    // Check for existing pending purchase first
    const existingPendingPurchase = await models.purchases.findOne({
      userId: mongoUser._id,
      postId: message._id,
      postType: "chatmessages",
      status: "pending",
    });

    let purchase;

    if (existingPendingPurchase) {
      console.log(
        "Found existing pending purchase:",
        existingPendingPurchase._id
      );
      purchase = existingPendingPurchase;
    } else {
      // Create a new purchase record
      try {
        // Ensure we have a valid user ID
        if (!mongoUser._id) {
          throw new Error("Invalid user ID");
        }

        const purchaseData = {
          userId: mongoUser._id,
          postId: message._id,
          postType: "chatmessages", // Explicitly set postType for chat messages
          amount: message.price,
          status: "pending",
        };

        console.log(
          "Creating purchase with data:",
          JSON.stringify(purchaseData)
        );

        purchase = await models.purchases.create(purchaseData);
        console.log("Initial purchase record created:", purchase._id);
      } catch (purchaseError) {
        console.error(
          "Error creating initial purchase record:",
          purchaseError.message
        );

        // If it's a duplicate key error, try to find the existing record again
        // This handles race conditions where a purchase was created between our check and create
        if (purchaseError.message.includes("duplicate key error")) {
          console.log(
            "Duplicate key error detected, finding existing purchase"
          );
          const existingPurchase = await models.purchases.findOne({
            userId: mongoUser._id,
            postId: message._id,
            postType: "chatmessages",
          });

          if (existingPurchase) {
            console.log(
              "Found existing purchase after duplicate key error:",
              existingPurchase._id
            );
            purchase = existingPurchase;
          } else {
            return NextResponse.json(
              {
                error: "Error creating purchase record",
                details: purchaseError.message,
              },
              { status: 500 }
            );
          }
        } else {
          return NextResponse.json(
            {
              error: "Error creating purchase record",
              details: purchaseError.message,
            },
            { status: 500 }
          );
        }
      }
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

    // Determine base URL for success/cancel redirects
    const baseUrl =
      process.env.NEXT_PUBLIC_CLIENT_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    console.log("Creating Stripe session with base URL:", baseUrl);

    try {
      // Create a checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Paid Message Access",
                description: `Access to premium message content (Message ID: ${message._id})`,
              },
              unit_amount: Math.round(message.price * 100), // Stripe uses cents, ensure integer
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${baseUrl}/api/stripe/chatmessages/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/chatrooms/${message.chatRoomId}`,
        metadata: {
          postId: message._id.toString(),
          userId: mongoUser._id.toString(),
          purchaseId: purchase._id.toString(),
          postType: "chatmessages",
          chatRoomId: message.chatRoomId,
        },
        customer_email: mongoUser.email,
      });

      console.log("Stripe session created:", session.id);

      // Update the purchase record with the session ID
      await models.purchases.findByIdAndUpdate(purchase._id, {
        stripeSessionId: session.id,
      });
      console.log("Purchase record updated with session ID");

      return NextResponse.json({ sessionUrl: session.url });
    } catch (stripeError) {
      console.error("Stripe session creation error:", stripeError.message);

      // Only clean up if we created a new purchase (not if we're using an existing one)
      if (!existingPendingPurchase) {
        try {
          await models.purchases.findByIdAndDelete(purchase._id);
          console.log("Cleaned up purchase record after Stripe error");
        } catch (cleanupError) {
          console.error(
            "Error cleaning up purchase record:",
            cleanupError.message
          );
        }
      }

      return NextResponse.json(
        {
          error: "Error creating payment session",
          details: stripeError.message,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Stripe payment error:", error.message, error.stack);
    return NextResponse.json(
      { error: "Error processing payment request", details: error.message },
      { status: 500 }
    );
  }
}
