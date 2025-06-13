"use server";

import { update } from "./crud";
import shippoService from "@/lib/utils/shippo/shippoService";
import { getStoreOwnerShippingAddress } from "./getStoreOwnerShippingAddress";

export const createShippoShipment = async (order) => {
  try {
    console.log(`Creating Shippo shipment for order ${order.orderNumber}`);

    // Get store owner's shipping address
    const storeOwnerAddressResult = await getStoreOwnerShippingAddress({
      storeOwnerId: order.storeOwner,
    });

    let storeOwnerShippingAddress = null;

    // Check if this is a dev order (allow bypassing shipping address requirement)
    const isDevOrder = order.devMode || false;

    if (storeOwnerAddressResult.error && !isDevOrder) {
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
        "✅ Using store owner's shipping address for shipment creation"
      );
    } else if (isDevOrder) {
      console.log(
        "⚠️ Dev order - using fallback address for shipment creation"
      );
      // For dev orders, we'll use the default address in shippoService
    }

    const shipment = await shippoService.createShipment(
      order,
      storeOwnerShippingAddress
    );

    // Get the cheapest USPS rate and create the shipping label immediately
    let shippingLabelUrl = null;
    let trackingNumber = null;
    let shippoTransactionId = null;
    let carrierAccount = "USPS"; // Default to USPS as per requirements
    let labelBrokerQRCodeUrl = null;

    if (shipment.rates && shipment.rates.length > 0) {
      try {
        console.log(`Creating shipping label for order ${order.orderNumber}`);
        const cheapestRate = shippoService.getCheapestRate(shipment.rates);
        const transaction = await shippoService.createShippingLabel(
          shipment.object_id,
          cheapestRate.object_id
        );

        if (transaction && transaction.label_url) {
          shippingLabelUrl = transaction.label_url;
          trackingNumber = transaction.tracking_number;
          shippoTransactionId = transaction.object_id;

          // Get carrier name from the transaction or rate, ensuring it's USPS
          carrierAccount =
            shippoService.getCarrierName(transaction) ||
            shippoService.getCarrierName(cheapestRate) ||
            "USPS";

          console.log(
            `✅ Shipping label created for order ${order.orderNumber}: ${shippingLabelUrl}`
          );
          console.log(`✅ Carrier: ${carrierAccount}`);

          // Get Label Broker QR Code URL if available
          if (transaction.qr_code_url) {
            labelBrokerQRCodeUrl = transaction.qr_code_url;
            console.log(
              `✅ Label Broker QR Code available for order ${order.orderNumber}: ${labelBrokerQRCodeUrl}`
            );
          }
        }
      } catch (labelError) {
        console.error(
          `❌ Error creating shipping label for order ${order.orderNumber}:`,
          labelError
        );
        // Continue even if label creation fails
      }
    }

    // Update order with Shippo shipment information and label if created
    const updateResult = await update({
      col: "storeitemsorders",
      data: { _id: order._id },
      update: {
        shippoShipmentId: shipment.object_id,
        shippoRates: shipment.rates,
        orderStatus: "processing",
        carrierAccount: carrierAccount, // Always set carrier account to USPS
        ...(shippingLabelUrl && {
          shippingLabelUrl: shippingLabelUrl,
          trackingNumber: trackingNumber,
          shippoTransactionId: shippoTransactionId,
          ...(labelBrokerQRCodeUrl && {
            labelBrokerQRCodeUrl: labelBrokerQRCodeUrl,
          }),
        }),
      },
    });

    if (updateResult.error) {
      console.error(
        "Error updating order with shipment info:",
        updateResult.error
      );
      return { error: updateResult.error };
    } else {
      console.log(
        `✅ Shippo shipment created for order ${order.orderNumber}: ${shipment.object_id}; Shipping to: ${storeOwnerShippingAddress}; Shipping from: ${shipment.from_address}`
      );
      console.log(`✅ Carrier account set to: ${carrierAccount}`);
      if (shippingLabelUrl) {
        console.log(`✅ Shipping label URL saved: ${shippingLabelUrl}`);
      }
      return {
        success: true,
        shipment,
        shippingLabelUrl,
        trackingNumber,
        shippoTransactionId,
        carrierAccount,
        labelBrokerQRCodeUrl,
      };
    }
  } catch (shippoError) {
    console.error(
      `❌ Error creating Shippo shipment for order ${order.orderNumber}:`,
      shippoError
    );
    return { error: shippoError.message || "Failed to create Shippo shipment" };
  }
};

export const createShippoShipmentsForOrders = async (orders) => {
  try {
    const results = [];

    for (const order of orders) {
      const result = await createShippoShipment(order);
      results.push({
        orderId: order._id,
        orderNumber: order.orderNumber,
        ...result,
      });
    }

    return { success: true, results };
  } catch (error) {
    console.error("Error in createShippoShipmentsForOrders:", error);
    return { error: error.message || "Failed to create Shippo shipments" };
  }
};
