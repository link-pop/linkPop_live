export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";

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

    // Check if user has a Stripe Connect account
    if (!mongoUser.stripeConnect?.accountId) {
      return NextResponse.json(
        { error: "User does not have a Stripe Connect account" },
        { status: 400 }
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Determine base URL for redirects
    const baseUrl =
      process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:3000";

    const accountId = mongoUser.stripeConnect.accountId;

    // Create account link for continuing onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${baseUrl}/api/stripe/connect/refresh?account_id=${accountId}`,
      return_url: `${baseUrl}/api/stripe/connect/return?account_id=${accountId}`,
      type: "account_onboarding",
    });

    console.log("Created account link for continuing onboarding");

    return NextResponse.json({
      success: true,
      accountId: accountId,
      accountLinkUrl: accountLink.url,
    });
  } catch (error) {
    console.error("Error continuing Stripe Connect onboarding:", error);
    return NextResponse.json(
      {
        error: "Failed to continue Stripe Connect onboarding",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
