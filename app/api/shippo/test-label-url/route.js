import { NextResponse } from "next/server";
import shippoService from "@/lib/utils/shippo/shippoService";

export async function POST(request) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Create a test order with dummy data for Shippo testing
    const testOrder = {
      _id: orderId,
      orderNumber: `TEST-${Date.now()}`,
      items: [
        {
          storeItemId: "test-item",
          quantity: 1,
          priceAtTime: 10.0,
          title: "Test Item",
          category: "Test Category",
        },
      ],
      shippingAddress: {
        name: "John Doe",
        line1: "1600 Amphitheatre Parkway",
        line2: "",
        city: "Mountain View",
        state: "CA",
        postal_code: "94043",
        country: "US",
      },
    };

    console.log("Creating test Shippo shipment...");

    // Create shipment
    const shipment = await shippoService.createShipment(testOrder);
    console.log("Test shipment created:", shipment.object_id);

    if (!shipment.rates || shipment.rates.length === 0) {
      return NextResponse.json(
        { error: "No shipping rates available" },
        { status: 400 }
      );
    }

    // Get the cheapest rate
    const cheapestRate = shippoService.getCheapestRate(shipment.rates);
    console.log("Using rate:", cheapestRate.object_id);

    // Create shipping label
    const transaction = await shippoService.createShippingLabel(
      shipment.object_id,
      cheapestRate.object_id
    );

    console.log("Test label created:", transaction.object_id);
    console.log("Label URL:", transaction.label_url);

    return NextResponse.json({
      success: true,
      shipment: {
        id: shipment.object_id,
        rates: shipment.rates.length,
      },
      label: {
        url: transaction.label_url,
        trackingNumber: transaction.tracking_number,
        transactionId: transaction.object_id,
      },
    });
  } catch (error) {
    console.error("Test label creation error:", error);
    return NextResponse.json(
      {
        error: "Failed to create test label",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
