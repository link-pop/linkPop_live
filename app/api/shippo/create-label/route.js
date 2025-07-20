import { NextResponse } from "next/server";
import { createShippingLabel } from "@/lib/actions/shippoActions";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    // Parse request body
    const { orderId, rateId } = await request.json();

    if (!orderId || !rateId) {
      return NextResponse.json(
        { error: "Order ID and Rate ID are required" },
        { status: 400 }
      );
    }

    // Create shipping label with proper ownership checks
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
