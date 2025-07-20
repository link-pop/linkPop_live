import { NextResponse } from "next/server";
import Stripe from "stripe";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("account_id");

    if (!accountId) {
      return NextResponse.redirect(
        new URL("/add/storeitems?error=missing_account_id", request.url)
      );
    }

    // Get the authenticated user
    const { mongoUser } = await getMongoUser();
    if (!mongoUser) {
      return NextResponse.redirect(
        new URL("/sign-in?error=not_authenticated", request.url)
      );
    }

    // Verify this account belongs to the user
    if (mongoUser.stripeConnect?.accountId !== accountId) {
      return NextResponse.redirect(
        new URL("/add/storeitems?error=account_mismatch", request.url)
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Determine base URL for redirects
    const baseUrl =
      process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:3000";

    // Create a new account link for refreshed onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${baseUrl}/api/stripe/connect/refresh?account_id=${accountId}`,
      return_url: `${baseUrl}/api/stripe/connect/return?account_id=${accountId}`,
      type: "account_onboarding",
    });

    console.log("Created refreshed account link for onboarding");

    // Redirect to the new onboarding link
    return NextResponse.redirect(accountLink.url);
  } catch (error) {
    console.error("Error refreshing Stripe Connect onboarding:", error);
    return NextResponse.redirect(
      new URL("/add/storeitems?error=refresh_error", request.url)
    );
  }
}
