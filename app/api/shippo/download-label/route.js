import { NextResponse } from "next/server";
import { downloadShippingLabel } from "@/lib/actions/shippoActions";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    // Parse request body
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Download shipping label with proper ownership checks
    const result = await downloadShippingLabel({
      orderId,
    });

    if (result.error) {
      console.error("Error downloading shipping label:", result.error);
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      label: result.label,
    });
  } catch (error) {
    console.error("Download label API error:", error);
    return NextResponse.json(
      {
        error: "Failed to download shipping label",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
