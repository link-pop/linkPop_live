"use server";

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { models } from "@/lib/db/models/models";
import { connectToDb } from "@/lib/db/connectToDb";
import { update } from "@/lib/actions/crud";
import { clearUserCart } from "@/lib/actions/userCartActions";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      console.error("No session_id provided");
      return NextResponse.redirect(
        new URL("/cart?error=missing_session", request.url)
      );
    }

    console.log("Processing payment success for session:", sessionId);

    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });

    if (!session) {
      console.error("Session not found:", sessionId);
      return NextResponse.redirect(
        new URL("/cart?error=session_not_found", request.url)
      );
    }

    console.log("Stripe session retrieved:", {
      id: session.id,
      payment_status: session.payment_status,
      payment_intent: session.payment_intent?.id,
    });

    // Check if payment was successful
    if (session.payment_status !== "paid") {
      console.error("Payment not completed:", session.payment_status);
      return NextResponse.redirect(
        new URL("/cart?error=payment_not_completed", request.url)
      );
    }

    // Connect to database
    await connectToDb();

    // Find the order by Stripe session ID
    const order = await models.storeitemsorders
      .findOne({
        stripeSessionId: sessionId,
      })
      .lean();

    if (!order) {
      console.error("Order not found for session:", sessionId);
      return NextResponse.redirect(
        new URL("/cart?error=order_not_found", request.url)
      );
    }

    console.log("Order found:", order.orderNumber);

    // Check if order is already marked as paid
    if (order.paymentStatus === "paid") {
      console.log("Order already marked as paid, redirecting to success page");
      return NextResponse.redirect(
        new URL(`/cart/success?session_id=${sessionId}`, request.url)
      );
    }

    // Calculate final total from Stripe session
    const finalTotal = session.amount_total / 100; // Convert from cents to dollars
    const tax = (session.total_details?.amount_tax || 0) / 100;
    const shipping = (session.total_details?.amount_shipping || 0) / 100;

    // Update shipping address from Stripe session
    const shippingAddress = session.shipping?.address
      ? {
          name: session.shipping.name,
          line1: session.shipping.address.line1,
          line2: session.shipping.address.line2 || "",
          city: session.shipping.address.city,
          state: session.shipping.address.state,
          postal_code: session.shipping.address.postal_code,
          country: session.shipping.address.country,
        }
      : order.shippingAddress; // Keep existing dummy address if no shipping collected

    // Update order with payment information
    const updateResult = await update({
      col: "storeitemsorders",
      data: { _id: order._id },
      update: {
        paymentStatus: "paid",
        orderStatus: "processing",
        stripePaymentIntentId: session.payment_intent?.id,
        total: finalTotal,
        tax: tax,
        shipping: shipping,
        shippingAddress: shippingAddress,
      },
    });

    if (updateResult.error) {
      console.error("Error updating order payment status:", updateResult.error);
      return NextResponse.redirect(
        new URL("/cart?error=update_failed", request.url)
      );
    }

    console.log(`✅ Order ${order.orderNumber} marked as paid`);
    console.log("Updated order data:", updateResult);

    // Clear user's cart after successful payment
    try {
      // Get user from order
      const { mongoUser } = await getMongoUser();
      if (
        mongoUser &&
        mongoUser._id.toString() === order.createdBy.toString()
      ) {
        const clearResult = await clearUserCart();
        if (clearResult.error) {
          console.warn("Cart clearing warning:", clearResult.error);
        } else {
          console.log(`✅ Cart cleared for user ${mongoUser._id}`);
        }
      }
    } catch (cartError) {
      console.error("Error clearing cart:", cartError);
      // Don't fail the success flow if cart clearing fails
    }

    // Redirect to success page
    return NextResponse.redirect(
      new URL(`/cart/success?session_id=${sessionId}`, request.url)
    );
  } catch (error) {
    console.error("Cart success processing error:", error);
    return NextResponse.redirect(
      new URL("/cart?error=processing_failed", request.url)
    );
  }
}
