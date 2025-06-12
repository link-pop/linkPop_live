import { NextResponse } from "next/server";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import shippoService from "@/lib/utils/shippo/shippoService";

export async function POST(request) {
  try {
    // Get the authenticated user
    const { mongoUser } = await getMongoUser();
    if (!mongoUser) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Parse request body
    const { shippingAddress, cartGroups } = await request.json();

    if (!shippingAddress) {
      return NextResponse.json(
        { error: "Shipping address is required" },
        { status: 400 }
      );
    }

    if (!cartGroups || !cartGroups.length) {
      return NextResponse.json(
        { error: "Cart items are required" },
        { status: 400 }
      );
    }

    // Validate shipping address
    const requiredFields = [
      "name",
      "line1",
      "city",
      "state",
      "postal_code",
      "country",
    ];
    for (const field of requiredFields) {
      if (!shippingAddress[field]?.trim()) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    console.log("Calculating shipping rates for cart items...");

    // Create a mock order structure for Shippo rate calculation
    const mockOrder = {
      orderNumber: `RATE-CALC-${Date.now()}`,
      items: [],
      shippingAddress: shippingAddress,
    };

    // Flatten all cart items from all store owners into one shipment
    // In practice, you might want to calculate rates per store owner
    cartGroups.forEach((group) => {
      group.items.forEach((cartItem) => {
        const storeItem = cartItem.storeItemId;
        if (storeItem) {
          mockOrder.items.push({
            storeItemId: storeItem._id,
            quantity: cartItem.quantity,
            priceAtTime: storeItem.price,
            title: storeItem.title,
            category: storeItem.category,
          });
        }
      });
    });

    if (!mockOrder.items.length) {
      return NextResponse.json(
        { error: "No valid items found in cart" },
        { status: 400 }
      );
    }

    // Create shipment in Shippo to get rates
    const shipment = await shippoService.createShipment(mockOrder);

    if (!shipment.rates || shipment.rates.length === 0) {
      return NextResponse.json(
        { error: "No shipping rates available for this address" },
        { status: 400 }
      );
    }

    // Filter and format rates for frontend
    const formattedRates = shipment.rates.map((rate) => ({
      object_id: rate.object_id,
      provider: rate.provider,
      servicelevel: rate.servicelevel,
      amount: rate.amount,
      currency: rate.currency,
      estimated_days: rate.estimated_days,
      duration_terms: rate.duration_terms,
    }));

    console.log(`Found ${formattedRates.length} shipping rates`);

    return NextResponse.json({
      success: true,
      rates: formattedRates,
      shipmentId: shipment.object_id, // Store for potential future use
    });
  } catch (error) {
    console.error("Calculate rates API error:", error);
    return NextResponse.json(
      {
        error: "Failed to calculate shipping rates",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
