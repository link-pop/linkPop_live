import { getOne, add, update } from "@/lib/actions/crud";
import { redirect } from "next/navigation";
import { generateActivationKey } from "./generateActivationKey";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

// /api/stripe/products/success/route.js
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return new Response(JSON.stringify({ error: "User ID is required" }), {
        status: 400,
      });
    }

    // Get the user's cart
    const cart = await getOne({
      col: "carts",
      data: { userId },
      populate: "items.productId",
    });

    if (!cart) {
      return new Response(JSON.stringify({ error: "Cart not found" }), {
        status: 404,
      });
    }

    // ! qookeys specific: Add activation keys to each item
    const itemsWithKeys = cart.items.map((item) => ({
      ...item,
      activationKey: generateActivationKey(),
    }));

    // Create an order from the cart
    const order = await add({
      col: "orders",
      data: {
        createdBy: new mongoose.Types.ObjectId(userId),
        userId,
        // ! qookeys specific: Add activation keys to each item
        items: itemsWithKeys,
        total: itemsWithKeys
          .reduce(
            (sum, item) =>
              sum +
              (item.productId?.["discounted price"] || item.productId?.price) *
                item.quantity,
            0
          )
          .toFixed(2),
      },
    });

    // Clear the cart by updating it with empty items array
    await update({
      col: "carts",
      data: { userId },
      update: {
        items: [], // Empty the items array
      },
    });

    // Redirect to orders page
    return Response.redirect(
      new URL(`/orders/${order._id}`, process.env.NEXT_PUBLIC_CLIENT_URL)
    );
  } catch (error) {
    console.error("Error in success route:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Something went wrong" }),
      {
        status: 500,
      }
    );
  }
}
