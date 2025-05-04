// npm i stripe
import { getOne } from "@/lib/actions/crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import _stripe from "stripe";
const __stripe = _stripe(process.env.STRIPE_SECRET_KEY);

// /api/stripe/products/route.js
export async function POST(req) {
  const { mongoUser } = await getMongoUser();
  const userId = mongoUser?._id;
  const userEmail = mongoUser?.email;

  if (req.method === "POST") {
    try {
      const body = await req.json();
      const { col } = body;

      // Fetch cart items from database
      const cart = await getOne({
        col: "carts",
        data: { userId },
        populate: "items.productId",
      });

      if (!cart || !cart.items) {
        return new Response(JSON.stringify({ error: "Cart not found" }), {
          status: 404,
        });
      }

      const lineItems = cart.items.map((item) => {
        const product = item.productId;
        let unit_amount;
        if (product?.["discounted price"] == null) {
          unit_amount = Math.round(Number(product.price) * 100);
        } else {
          unit_amount = Math.round(Number(product?.["discounted price"]) * 100);
        }

        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: product.title,
              description: product?.subtitle,
              images: product.files?.[0]?.fileUrl
                ? [product.files[0].fileUrl]
                : [],
            },
            unit_amount,
          },
          quantity: item.quantity || 1, // Default to 1 if not specified
        };
      });

      // Create a Checkout Session
      const session = await __stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${process.env.NEXT_PUBLIC_CLIENT_URL}/api/stripe/products/success?userId=${userId}`,
        cancel_url: `${process.env.NEXT_PUBLIC_CLIENT_URL}`,
        customer_email: userEmail,
      });

      return new Response(JSON.stringify({ sessionUrl: session.url }));
    } catch (err) {
      console.error(err);
      return new Response(
        JSON.stringify({ error: err.raw?.message || "Something went wrong" }),
        { status: 500 }
      );
    }
  } else {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
    });
  }
}
