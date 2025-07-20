import { NextResponse } from "next/server";
import { downloadLabelBrokerQRCode } from "@/lib/actions/shippoActions";

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

    // Download Label Broker QR Code with proper ownership checks
    const result = await downloadLabelBrokerQRCode({
      orderId,
    });

    if (result.error) {
      console.error("Error downloading Label Broker QR Code:", result.error);
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      qrCode: result.qrCode,
    });
  } catch (error) {
    console.error("Download QR Code API error:", error);
    return NextResponse.json(
      {
        error: "Failed to download Label Broker QR Code",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
