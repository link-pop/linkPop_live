import { NextResponse } from "next/server";
import Stripe from "stripe";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import { update } from "@/lib/actions/crud";
import { SITE1, SITE2 } from "@/config/env";
import { AFFILIATE_ROUTE } from "@/lib/utils/constants";

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

    // Retrieve the account to check its status
    const account = await stripe.accounts.retrieve(accountId);

    console.log("Retrieved account after onboarding:", {
      id: account.id,
      details_submitted: account.details_submitted,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
    });

    // Update user with latest account info
    const updateResult = await update({
      col: "users",
      data: { _id: mongoUser._id },
      update: {
        "stripeConnect.onboardingCompleted": account.details_submitted,
        "stripeConnect.detailsSubmitted": account.details_submitted,
        "stripeConnect.chargesEnabled": account.charges_enabled,
        "stripeConnect.payoutsEnabled": account.payouts_enabled,
        "stripeConnect.country": account.country,
        "stripeConnect.currency": account.default_currency,
        "stripeConnect.lastUpdated": new Date(),
        "stripeConnect.onboardedAt": account.details_submitted
          ? new Date()
          : null,
        "stripeConnect.requirements": {
          currentlyDue: account.requirements?.currently_due || [],
          eventuallyDue: account.requirements?.eventually_due || [],
          pastDue: account.requirements?.past_due || [],
          pendingVerification: account.requirements?.pending_verification || [],
        },
        "stripeConnect.capabilities": {
          cardPayments: account.capabilities?.card_payments,
          transfers: account.capabilities?.transfers,
        },
      },
    });

    if (updateResult.error) {
      console.error(
        "Error updating user after onboarding:",
        updateResult.error
      );
    }

    // Determine redirect URL based on onboarding status
    if (account.details_submitted && account.charges_enabled) {
      // Onboarding completed successfully
      return NextResponse.redirect(
        new URL(
          `${
            SITE1
              ? "/add/storeitems?success=onboarding_complete"
              : AFFILIATE_ROUTE
          }`,
          request.url
        )
      );
    } else if (account.details_submitted) {
      // Onboarding submitted but not yet approved
      return NextResponse.redirect(
        new URL(
          `${
            SITE1
              ? "/add/storeitems?success=onboarding_submitted"
              : AFFILIATE_ROUTE
          }`,
          request.url
        )
      );
    } else {
      // Onboarding not completed
      return NextResponse.redirect(
        new URL("/add/storeitems?error=onboarding_incomplete", request.url)
      );
    }
  } catch (error) {
    console.error("Error handling Stripe Connect return:", error);
    return NextResponse.redirect(
      new URL("/add/storeitems?error=onboarding_error", request.url)
    );
  }
}
