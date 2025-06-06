import { NextResponse } from "next/server";
import Stripe from "stripe";
import { models } from "@/lib/db/models/models";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import { add, update } from "@/lib/actions/crud";
import shippoService from "@/lib/utils/shippo/shippoService";

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
      ? `${baseUrl}/api/stripe/cart/success?session_id={CHECKOUT_SESSION_ID}`
      : `https://${baseUrl}/api/stripe/cart/success?session_id={CHECKOUT_SESSION_ID}`;
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
        // Add dummy shipping address for Shippo shipment creation
        shippingAddress: {
          name: "John Doe",
          line1: "1600 Amphitheatre Parkway",
          line2: "",
          city: "Mountain View",
          state: "CA",
          postal_code: "94043",
          country: "US",
        },
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

    // Create Shippo shipment immediately after order creation
    try {
      console.log(`Creating Shippo shipment for order ${order.orderNumber}`);
      const shipment = await shippoService.createShipment(order);

      // Get the cheapest rate and create the shipping label immediately
      let shippingLabelUrl = null;
      let trackingNumber = null;
      let shippoTransactionId = null;
      let carrierAccount = null;
      let labelBrokerQRCodeUrl = null;

      if (shipment.rates && shipment.rates.length > 0) {
        try {
          console.log(`Creating shipping label for order ${order.orderNumber}`);
          const cheapestRate = shippoService.getCheapestRate(shipment.rates);
          const transaction = await shippoService.createShippingLabel(
            shipment.object_id,
            cheapestRate.object_id
          );

          if (transaction && transaction.label_url) {
            shippingLabelUrl = transaction.label_url;
            trackingNumber = transaction.tracking_number;
            shippoTransactionId = transaction.object_id;
            carrierAccount = transaction.rate?.carrier_account;
            console.log(
              `✅ Shipping label created for order ${order.orderNumber}: ${shippingLabelUrl}`
            );

            // Get Label Broker QR Code URL if available
            if (transaction.qr_code_url) {
              labelBrokerQRCodeUrl = transaction.qr_code_url;
              console.log(
                `✅ Label Broker QR Code available for order ${order.orderNumber}: ${labelBrokerQRCodeUrl}`
              );
            }
          }
        } catch (labelError) {
          console.error(
            `❌ Error creating shipping label for order ${order.orderNumber}:`,
            labelError
          );
          // Continue even if label creation fails
        }
      }

      // Update order with Shippo shipment information and label if created
      const updateResult = await update({
        col: "storeitemsorders",
        data: { _id: order._id },
        update: {
          shippoShipmentId: shipment.object_id,
          shippoRates: shipment.rates,
          orderStatus: "processing",
          ...(shippingLabelUrl && {
            shippingLabelUrl: shippingLabelUrl,
            trackingNumber: trackingNumber,
            shippoTransactionId: shippoTransactionId,
            carrierAccount: carrierAccount,
            ...(labelBrokerQRCodeUrl && {
              labelBrokerQRCodeUrl: labelBrokerQRCodeUrl,
            }),
          }),
        },
      });

      if (updateResult.error) {
        console.error(
          "Error updating order with shipment info:",
          updateResult.error
        );
      } else {
        console.log(
          `✅ Shippo shipment created for order ${order.orderNumber}: ${shipment.object_id}`
        );
        if (shippingLabelUrl) {
          console.log(`✅ Shipping label URL saved: ${shippingLabelUrl}`);
        }
      }
    } catch (shippoError) {
      console.error(
        `❌ Error creating Shippo shipment for order ${order.orderNumber}:`,
        shippoError
      );
      // Continue even if Shippo fails - don't break the checkout
    }

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
