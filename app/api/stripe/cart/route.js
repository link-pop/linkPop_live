import { NextResponse } from "next/server";
import Stripe from "stripe";
import { models } from "@/lib/db/models/models";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import { add } from "@/lib/actions/crud";

export async function POST(request) {
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

    // Get user's cart items
    const cartItems = await models.usercarts
      .find({
        createdBy: mongoUser._id,
      })
      .populate("storeItemId");

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    console.log(`Found ${cartItems.length} cart items`);

    // Validate cart items and calculate total
    let subtotal = 0;
    const lineItems = [];
    const orderItems = [];

    for (const cartItem of cartItems) {
      const storeItem = cartItem.storeItemId;

      if (!storeItem) {
        console.error(`Store item not found for cart item ${cartItem._id}`);
        continue;
      }

      if (!storeItem.price || storeItem.price <= 0) {
        console.error(`Invalid price for store item ${storeItem._id}`);
        continue;
      }

      const itemTotal = storeItem.price * cartItem.quantity;
      subtotal += itemTotal;

      // Prepare Stripe line item
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: storeItem.title || "Store Item",
            description: storeItem.text || "",
            images: storeItem.files?.[0]?.fileUrl
              ? [storeItem.files[0].fileUrl]
              : [],
          },
          unit_amount: Math.round(storeItem.price * 100), // Convert to cents
        },
        quantity: cartItem.quantity,
      });

      // Prepare order item for database
      orderItems.push({
        storeItemId: storeItem._id,
        quantity: cartItem.quantity,
        priceAtTime: storeItem.price,
        title: storeItem.title,
        category: storeItem.category,
      });
    }

    if (lineItems.length === 0) {
      return NextResponse.json(
        { error: "No valid items in cart" },
        { status: 400 }
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Construct proper URLs with protocol
    const baseUrl =
      process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:3000";
    const successUrl = baseUrl.startsWith("http")
      ? `${baseUrl}/cart/success?session_id={CHECKOUT_SESSION_ID}`
      : `https://${baseUrl}/cart/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = baseUrl.startsWith("http")
      ? `${baseUrl}/cart`
      : `https://${baseUrl}/cart`;

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: mongoUser.email,
      metadata: {
        userId: mongoUser._id.toString(),
        type: "cart_checkout",
        cartItemIds: cartItems.map((item) => item._id.toString()).join(","),
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

    // Generate order number manually
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const orderNumber = `ORD-${timestamp}-${random}`;

    // Create order record in database using CRUD add function
    const order = await add({
      col: "storeitemsorders",
      data: {
        createdBy: mongoUser._id,
        orderNumber: orderNumber, // Manually set the order number
        items: orderItems,
        subtotal: subtotal,
        tax: 0, // Will be calculated by Stripe
        shipping: 0, // Will be calculated by Stripe
        total: subtotal, // Will be updated after payment
        stripeSessionId: session.id,
        paymentStatus: "pending",
        orderStatus: "pending",
      },
    });

    if (order.error) {
      console.error("Error creating order:", order.error);
      return NextResponse.json(
        {
          error: "Failed to create order",
          details: order.error,
        },
        { status: 500 }
      );
    }

    console.log("Order created:", order.orderNumber);

    return NextResponse.json({
      sessionUrl: session.url,
      sessionId: session.id,
      orderNumber: order.orderNumber,
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
