import { NextResponse } from "next/server";
import { createLabelBrokerQRCode } from "@/lib/actions/shippoActions";

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

    // Create Label Broker QR Code with proper ownership checks
    const result = await createLabelBrokerQRCode({
      orderId,
    });

    if (result.error) {
      console.error("Error creating Label Broker QR Code:", result.error);
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      qrCode: result.qrCode,
    });
  } catch (error) {
    console.error("Create QR Code API error:", error);
    return NextResponse.json(
      {
        error: "Failed to create Label Broker QR Code",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
