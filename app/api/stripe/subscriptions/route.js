import { getOne } from "@/lib/actions/crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import _stripe from "stripe";

const __stripe = _stripe(process.env.STRIPE_SECRET_KEY);

// Fallback for base URL in different environments
const getBaseUrl = () => {
  return (
    process.env.NEXT_PUBLIC_CLIENT_URL ||
    process.env.VERCEL_URL ||
    "http://localhost:3000"
  );
};

export async function POST(req) {
  try {
    const { mongoUser } = await getMongoUser();
    const userId = mongoUser?._id;
    const userEmail = mongoUser?.email;

    if (!userId) {
      return new Response(JSON.stringify({ error: "User not authenticated" }), {
        status: 401,
      });
    }

    const body = await req.json();
    const { creatorId } = body;

    if (!creatorId) {
      return new Response(JSON.stringify({ error: "Creator ID is required" }), {
        status: 400,
      });
    }

    // Get creator details
    const creator = await getOne({
      col: "users",
      data: { _id: creatorId },
    });

    if (!creator) {
      return new Response(JSON.stringify({ error: "Creator not found" }), {
        status: 404,
      });
    }

    // Check if subscription price is set
    const price = creator.subscriptionPrice || 0;

    if (price <= 0) {
      return new Response(
        JSON.stringify({
          error: "This creator does not have a paid subscription",
        }),
        { status: 400 }
      );
    }

    // Create a Checkout Session
    const session = await __stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Subscription to ${creator.name}`,
              description: `1 month subscription to ${creator.name}'s content`,
            },
            unit_amount: Math.round(price * 100), // Convert to cents and ensure it's an integer
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${getBaseUrl()}/api/stripe/subscriptions/success?userId=${userId}&creatorId=${creatorId}&sessionId={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getBaseUrl()}/${creator.name}`,
      customer_email: userEmail,
      metadata: {
        userId: userId.toString(),
        creatorId: creatorId.toString(),
      },
    });

    return new Response(JSON.stringify({ sessionUrl: session.url }));
  } catch (error) {
    console.error("Stripe subscription error:", error);

    return new Response(
      JSON.stringify({
        error:
          error.message ||
          "An error occurred while processing your subscription",
      }),
      { status: 500 }
    );
  }
}
