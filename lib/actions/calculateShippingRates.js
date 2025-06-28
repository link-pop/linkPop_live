"use server";

import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import shippoService from "@/lib/utils/shippo/shippoService";
import { getStoreOwnerShippingAddress } from "./getStoreOwnerShippingAddress";

export const dynamic = "force-dynamic";

export const calculateShippingRates = async ({
  shippingAddress,
  cartGroups,
}) => {
  try {
    const { mongoUser } = await getMongoUser();
    if (!mongoUser?._id) {
      return { error: "User not authenticated" };
    }

    if (!shippingAddress) {
      return { error: "Shipping address is required" };
    }

    if (!cartGroups || !cartGroups.length) {
      return { error: "Cart items are required" };
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
        return { error: `Missing required field: ${field}` };
      }
    }

    console.log("Calculating shipping rates for cart items...");

    // TODO ! NOT NOW ! calculate rates per store owner
    // For now, we'll use the first store owner's address for shipping calculation
    // In a more complex scenario, you might want to calculate rates per store owner
    const firstStoreOwner = cartGroups[0]?.storeOwner;
    if (!firstStoreOwner?._id) {
      return { error: "No valid store owner found in cart items" };
    }

    // Get store owner's shipping address
    const storeOwnerAddressResult = await getStoreOwnerShippingAddress({
      storeOwnerId: firstStoreOwner._id,
    });

    let storeOwnerShippingAddress = null;
    let isDev = firstStoreOwner.isDev || false;

    // For dev users, allow bypassing shipping address requirement
    if (storeOwnerAddressResult.error && !isDev) {
      console.log(
        "❌ Store owner shipping address error:",
        storeOwnerAddressResult.error
      );
      return {
        error: storeOwnerAddressResult.error,
        needsConfiguration: storeOwnerAddressResult.needsConfiguration,
      };
    }

    if (storeOwnerAddressResult.success) {
      storeOwnerShippingAddress = storeOwnerAddressResult.shippingAddress;
      console.log(
        "✅ Using store owner's shipping address for rate calculation"
      );
    } else if (isDev) {
      console.log(
        "⚠️ Dev user - using fallback address for shipping calculation"
      );
      // For dev users, we'll use the default address in shippoService
    }

    // Create a mock order structure for Shippo rate calculation
    const mockOrder = {
      orderNumber: `RATE-CALC-${Date.now()}`,
      items: [],
      shippingAddress: shippingAddress,
    };

    // Flatten all cart items from all store owners into one shipment
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
      return { error: "No valid items found in cart" };
    }

    // Create shipment in Shippo to get rates using store owner's address
    const shipment = await shippoService.createShipment(
      mockOrder,
      storeOwnerShippingAddress
    );

    if (!shipment.rates || shipment.rates.length === 0) {
      return { error: "No shipping rates available for this address" };
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

    console.log(
      `Found ${
        formattedRates.length
      } shipping rates; Rates: ${formattedRates.map((rate) => rate.amount)}`
    );

    return {
      success: true,
      rates: formattedRates,
      shipmentId: shipment.object_id,
    };
  } catch (error) {
    console.error("Calculate rates error:", error);
    return { error: error.message || "Failed to calculate shipping rates" };
  }
};
