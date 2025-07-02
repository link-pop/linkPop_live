import { NextResponse } from "next/server";
import Stripe from "stripe";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import { SUBSCRIPTION_PLANS } from "@/lib/utils/constants";

export async function POST(request) {
  try {
    // Get the authenticated user
    const { mongoUser } = await getMongoUser();

    if (!mongoUser) {
      console.error("❌ User not authenticated");
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Allow any authenticated user to use test endpoint for webhook testing

    console.log("Creating test subscription for user:", mongoUser._id);

    // Parse request body
    const body = await request.json();
    const { amount = 50, duration = 1, planType = "creator" } = body;

    // Verify Stripe key is available
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("❌ Missing STRIPE_SECRET_KEY environment variable");
      return NextResponse.json(
        { error: "Payment service configuration error" },
        { status: 500 }
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Create a test product for the subscription
    const product = await stripe.products.create({
      name: `Test ${SUBSCRIPTION_PLANS.CREATOR.NAME} Plan`,
      description: `Test subscription for webhook synchronization testing - $${(
        amount / 100
      ).toFixed(2)} for ${duration} day`,
      metadata: {
        isTestProduct: "true",
        testDuration: duration.toString(),
        originalPlan: planType,
      },
    });

    // Create a test price for the product (daily billing for fast testing)
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: amount, // Amount in cents
      currency: "usd",
      recurring: {
        interval: "day",
        interval_count: duration,
      },
      metadata: {
        isTestPrice: "true",
        testDuration: duration.toString(),
        originalPlan: planType,
      },
    });

    // Determine base URL for redirects
    const baseUrl =
      process.env.NEXT_PUBLIC_CLIENT_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    console.log("Creating test Stripe session with base URL:", baseUrl);

    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${baseUrl}/pricing?session_id={CHECKOUT_SESSION_ID}&success=true&subtest=true`,
      cancel_url: `${baseUrl}/pricing?error=paymentCanceled&subtest=true`,
      customer_email: mongoUser.email,
      metadata: {
        createdBy: mongoUser._id.toString(),
        planId: SUBSCRIPTION_PLANS.CREATOR.PLAN_ID, // Use actual Creator plan ID
        isTest: "true",
        testDuration: duration.toString(),
        testAmount: amount.toString(),
        originalPlan: planType,
      },
      subscription_data: {
        trial_period_days: 1, // 1 day trial to avoid Stripe minimum requirement
        metadata: {
          createdBy: mongoUser._id.toString(),
          planId: SUBSCRIPTION_PLANS.CREATOR.PLAN_ID,
          isTest: "true",
          testDuration: duration.toString(),
          testAmount: amount.toString(),
          originalPlan: planType,
        },
      },
    });

    console.log("Test subscription session created:", session.id);

    return NextResponse.json({
      sessionUrl: session.url,
      sessionId: session.id,
      message: `Test subscription created: $${(amount / 100).toFixed(
        2
      )} for ${duration} day(s)`,
    });
  } catch (error) {
    console.error("❌ Error creating test subscription:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to create test subscription",
        details: error.stack,
      },
      { status: 500 }
    );
  }
}
