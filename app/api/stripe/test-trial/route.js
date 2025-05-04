import { NextResponse } from "next/server";
import Stripe from "stripe";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";

// ! code start test trial API
export async function POST(req) {
  try {
    // Check if user is an admin
    const { mongoUser, isAdmin } = await getMongoUser();

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { trialDays = 1, amount = 50, testMode = true } = body;

    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Create a minimal price product for testing
    const product = await stripe.products.create({
      name: "Test Trial Subscription",
      description: "For admin testing of Stripe auto-renewal synchronization",
      metadata: {
        isTestProduct: "true",
      },
    });

    // Create a price for the test product
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: amount, // Amount in cents
      currency: "usd",
      recurring: {
        interval: "day", // Bill daily for faster testing
        interval_count: 1,
      },
      metadata: {
        isTestPrice: "true",
      },
    });

    // Determine base URL for success/cancel redirects with multiple fallbacks
    const baseUrl =
      process.env.NEXT_PUBLIC_CLIENT_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/pricing?success=true&session_id={CHECKOUT_SESSION_ID}&test=true`,
      cancel_url: `${baseUrl}/pricing?error=paymentCanceled&test=true`,
      customer_email: mongoUser.email || "admin@example.com",
      metadata: {
        createdBy: mongoUser._id.toString(),
        planId: "test_trial_plan",
        isTest: "true",
        testMode: testMode ? "true" : "false",
      },
      subscription_data: {
        trial_period_days: trialDays,
        metadata: {
          createdBy: mongoUser._id.toString(),
          planId: "test_trial_plan",
          isTest: "true",
        },
      },
    });

    return NextResponse.json({ sessionUrl: session.url });
  } catch (error) {
    console.error("Error creating test trial subscription:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create test subscription" },
      { status: 500 }
    );
  }
}
// ? code end test trial API
