import { update } from "@/lib/actions/crud";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

// /api/stripe/pricings/success/route.js
export async function GET(req) {
  try {
    // Get the host from headers
    const headersList = headers();
    const host = headersList.get("host");
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    // Get URL parameters
    const url = new URL(req.url);
    const post = JSON.parse(url.searchParams.get("post"));
    const userId = url.searchParams.get("userId");

    if (!post || !userId) {
      return NextResponse.redirect(
        new URL("/error?message=Missing required parameters", baseUrl)
      );
    }

    // ! updating user plan
    await update({
      col: "users",
      data: { _id: userId },
      // TODO: add "plan id"; !!! CAN BREAK access logic if title is updated by admin currently using title to set user plan
      update: { plan: post?.title },
    });

    // TODO: redirect to stripe/success ???
    // process.env.NEXT_PUBLIC_CLIENT_URL + "/stripe/success"
    return NextResponse.redirect(new URL("/", baseUrl));
  } catch (error) {
    console.error("Error updating user plan:", error);
    const errorUrl = new URL(
      "/error",
      process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:3000"
    );
    errorUrl.searchParams.set("message", "Failed to update user plan");
    return NextResponse.redirect(errorUrl);
  }
}
