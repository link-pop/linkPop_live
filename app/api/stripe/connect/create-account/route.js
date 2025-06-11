import { NextResponse } from "next/server";
import Stripe from "stripe";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import { update } from "@/lib/actions/crud";

export async function POST(request) {
  try {
    // Get the authenticated user
    const { mongoUser } = await getMongoUser();
    if (!mongoUser) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Check if user already has a Stripe Connect account
    if (mongoUser.stripeConnect?.accountId) {
      return NextResponse.json(
        { error: "User already has a Stripe Connect account" },
        { status: 400 }
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Determine base URL for redirects
    const baseUrl =
      process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:3000";

    // Create Express account instead of using OAuth
    const account = await stripe.accounts.create({
      type: "express",
      country: "US", // Default to US, can be changed during onboarding
      email: mongoUser.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: "individual", // Default, can be changed during onboarding
      metadata: {
        userId: mongoUser._id.toString(),
        userEmail: mongoUser.email,
      },
    });

    console.log("Created Stripe Express account:", account.id);

    // Update user with the new account ID
    const updateResult = await update({
      col: "users",
      data: { _id: mongoUser._id },
      update: {
        stripeConnect: {
          accountId: account.id,
          accountType: "express",
          onboardingCompleted: false,
          detailsSubmitted: false,
          chargesEnabled: false,
          payoutsEnabled: false,
          country: account.country,
          currency: account.default_currency || "usd",
          lastUpdated: new Date(),
          requirements: {
            currentlyDue: account.requirements?.currently_due || [],
            eventuallyDue: account.requirements?.eventually_due || [],
            pastDue: account.requirements?.past_due || [],
            pendingVerification:
              account.requirements?.pending_verification || [],
          },
          capabilities: {
            cardPayments: account.capabilities?.card_payments,
            transfers: account.capabilities?.transfers,
          },
        },
      },
    });

    if (updateResult.error) {
      console.error(
        "Error updating user with Stripe account:",
        updateResult.error
      );
      return NextResponse.json(
        { error: "Failed to save account information" },
        { status: 500 }
      );
    }

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${baseUrl}/api/stripe/connect/refresh?account_id=${account.id}`,
      return_url: `${baseUrl}/api/stripe/connect/return?account_id=${account.id}`,
      type: "account_onboarding",
    });

    console.log("Created account link for onboarding:", account.id);

    return NextResponse.json({
      success: true,
      accountId: account.id,
      accountLinkUrl: accountLink.url,
    });
  } catch (error) {
    console.error("Error creating Stripe Connect account:", error);
    return NextResponse.json(
      {
        error: "Failed to create Stripe Connect account",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
