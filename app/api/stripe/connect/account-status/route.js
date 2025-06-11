import { NextResponse } from "next/server";
import Stripe from "stripe";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import { update } from "@/lib/actions/crud";

export async function GET(request) {
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

    const accountId = mongoUser.stripeConnect.accountId;

    // Retrieve the latest account information from Stripe
    const account = await stripe.accounts.retrieve(accountId);

    console.log("Retrieved account status:", {
      id: account.id,
      details_submitted: account.details_submitted,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
    });

    // Prepare updated account info
    const updatedAccountInfo = {
      accountId: account.id,
      onboardingCompleted: account.details_submitted,
      detailsSubmitted: account.details_submitted,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      accountType: account.type,
      country: account.country,
      currency: account.default_currency,
      lastUpdated: new Date(),
      requirements: {
        currentlyDue: account.requirements?.currently_due || [],
        eventuallyDue: account.requirements?.eventually_due || [],
        pastDue: account.requirements?.past_due || [],
        pendingVerification: account.requirements?.pending_verification || [],
      },
      capabilities: {
        cardPayments: account.capabilities?.card_payments,
        transfers: account.capabilities?.transfers,
      },
    };

    // Update user with latest account info
    const updateResult = await update({
      col: "users",
      data: { _id: mongoUser._id },
      update: {
        stripeConnect: updatedAccountInfo,
      },
    });

    if (updateResult.error) {
      console.error(
        "Error updating user with latest account info:",
        updateResult.error
      );
      // Continue anyway, don't fail the request
    }

    return NextResponse.json({
      success: true,
      account: updatedAccountInfo,
    });
  } catch (error) {
    console.error("Error retrieving Stripe Connect account status:", error);
    return NextResponse.json(
      {
        error: "Failed to retrieve account status",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
