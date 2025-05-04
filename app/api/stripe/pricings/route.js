// npm i stripe
import { getOne } from "@/lib/actions/crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import _stripe from "stripe";
const __stripe = _stripe(process.env.STRIPE_SECRET_KEY);

// /api/stripe/pricings/route.js
export async function POST(req) {
  const { mongoUser } = await getMongoUser();
  const userId = mongoUser?._id;
  const userEmail = mongoUser?.email;

  if (req.method === "POST") {
    try {
      const body = await req.json();
      const { postId, col } = body;

      const post = await getOne({
        col: col.name,
        data: { _id: postId },
      });

      // Create a Checkout Session
      const session = await __stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: post?.title,
              },
              unit_amount: post?.price * 100, // The price in cents
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.NEXT_PUBLIC_CLIENT_URL}/api/stripe/${
          col.name
        }/success?userId=${userId}&post=${JSON.stringify(post)}`,
        cancel_url: `${process.env.NEXT_PUBLIC_CLIENT_URL}`,
        customer_email: userEmail,
      });
      // ! next.js Response
      return new Response(JSON.stringify({ sessionUrl: session.url }));
    } catch (err) {
      console.log(err.raw.message, err.raw.param);
    }
  } else {
    console.log("Something went wrong");
  }
}
