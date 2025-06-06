import { NextResponse } from "next/server";
import { createShippingLabel } from "@/lib/actions/shippoActions";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";

export async function POST(request) {
  try {
    // Get the authenticated user
    const { mongoUser } = await getMongoUser();
    if (!mongoUser) {
      console.error("User not authenticated");
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Parse request body
    const { orderId, rateId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Create shipping label
    const result = await createShippingLabel({
      orderId,
      rateId,
    });

    if (result.error) {
      console.error("Error creating shipping label:", result.error);
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      label: result.label,
    });
  } catch (error) {
    console.error("Create label API error:", error);
    return NextResponse.json(
      {
        error: "Failed to create shipping label",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
