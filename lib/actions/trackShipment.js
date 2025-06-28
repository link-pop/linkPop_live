"use server";

import { getOne } from "./crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import shippoService from "@/lib/utils/shippo/shippoService";

// Track shipment for an order
export const trackShipment = async ({ orderId }) => {
  try {
    const { mongoUser } = await getMongoUser();
    if (!mongoUser?._id) {
      return { error: "User not authenticated" };
    }

    // Get the order
    const order = await getOne({
      col: "storeitemsorders",
      data: {
        _id: orderId,
        createdBy: mongoUser._id,
      },
    });

    if (!order) {
      return { error: "Order not found" };
    }

    if (!order.trackingNumber) {
      return { error: "No tracking number available for this order" };
    }

    if (!order.carrierAccount) {
      return { error: "No carrier information available for this order" };
    }

    // Track the package using Shippo
    const trackingInfo = await shippoService.trackPackage(
      order.trackingNumber,
      order.carrierAccount
    );

    return {
      success: true,
      tracking: {
        trackingNumber: order.trackingNumber,
        carrier: order.carrierAccount,
        status: trackingInfo.tracking_status?.status,
        location: trackingInfo.tracking_status?.location,
        trackingHistory: trackingInfo.tracking_history || [],
        eta: trackingInfo.eta,
      },
    };
  } catch (error) {
    console.error("Error tracking shipment:", error);
    return { error: error.message || "Failed to track shipment" };
  }
};
