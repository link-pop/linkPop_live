"use server";

import { getOne, update } from "./crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import shippoService from "@/lib/utils/shippo/shippoService";

// Create shipment in Shippo for an order
export const createShippoShipment = async ({ orderId }) => {
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
      populate: "items.storeItemId",
    });

    if (!order) {
      return { error: "Order not found" };
    }

    if (order.paymentStatus !== "paid") {
      return { error: "Order must be paid before creating shipment" };
    }

    if (!order.shippingAddress) {
      return { error: "Order must have shipping address" };
    }

    // Check if shipment already exists
    if (order.shippoShipmentId) {
      return { error: "Shipment already exists for this order" };
    }

    // Create shipment in Shippo
    const shipment = await shippoService.createShipment(order);

    // Update order with shipment information
    const updateResult = await update({
      col: "storeitemsorders",
      data: { _id: order._id },
      update: {
        shippoShipmentId: shipment.object_id,
        shippoRates: shipment.rates,
        orderStatus: "processing",
      },
    });

    if (updateResult.error) {
      console.error(
        "Error updating order with shipment ID:",
        updateResult.error
      );
      return { error: "Failed to update order with shipment information" };
    }

    return {
      success: true,
      shipment: {
        id: shipment.object_id,
        rates: shipment.rates,
      },
    };
  } catch (error) {
    console.error("Error creating Shippo shipment:", error);
    return { error: error.message || "Failed to create shipment" };
  }
};

// Create shipping label
export const createShippingLabel = async ({ orderId, rateId }) => {
  try {
    console.log(`[createShippingLabel] Starting for orderId: ${orderId}`);

    const { mongoUser } = await getMongoUser();
    if (!mongoUser?._id) {
      console.error("[createShippingLabel] User not authenticated");
      return { error: "User not authenticated" };
    }

    console.log(`[createShippingLabel] User authenticated: ${mongoUser._id}`);

    // Get the order
    const order = await getOne({
      col: "storeitemsorders",
      data: {
        _id: orderId,
        createdBy: mongoUser._id,
      },
    });

    if (!order) {
      console.error(`[createShippingLabel] Order not found for ID: ${orderId}`);
      return { error: "Order not found" };
    }

    console.log(`[createShippingLabel] Order found: ${order.orderNumber}`);
    console.log(
      `[createShippingLabel] Order shippoShipmentId: ${order.shippoShipmentId}`
    );
    console.log(
      `[createShippingLabel] Order shippingLabelUrl: ${order.shippingLabelUrl}`
    );

    if (!order.shippoShipmentId) {
      console.error(
        `[createShippingLabel] No shipment ID for order: ${order.orderNumber}`
      );
      return { error: "Order must have a shipment created first" };
    }

    // Check if label already exists
    if (order.shippingLabelUrl) {
      console.log(
        `[createShippingLabel] Label already exists: ${order.shippingLabelUrl}`
      );
      return {
        success: true,
        label: {
          url: order.shippingLabelUrl,
          trackingNumber: order.trackingNumber,
          transactionId: order.shippoTransactionId,
        },
      };
    }

    // Use provided rateId or get the cheapest rate
    let selectedRateId = rateId;
    if (!selectedRateId && order.shippoRates?.length > 0) {
      console.log(
        `[createShippingLabel] Finding cheapest rate from ${order.shippoRates.length} rates`
      );
      const cheapestRate = shippoService.getCheapestRate(order.shippoRates);
      selectedRateId = cheapestRate.object_id;
      console.log(
        `[createShippingLabel] Selected cheapest rate: ${selectedRateId}`
      );
    }

    if (!selectedRateId) {
      console.error(
        `[createShippingLabel] No rate selected for order: ${order.orderNumber}`
      );
      return { error: "No shipping rate selected or available" };
    }

    console.log(
      `[createShippingLabel] Creating shipping label for order ${order.orderNumber} with rate ${selectedRateId}`
    );

    // Create label
    const transaction = await shippoService.createShippingLabel(
      order.shippoShipmentId,
      selectedRateId
    );

    console.log(`[createShippingLabel] Transaction response:`, transaction);

    if (!transaction || !transaction.label_url) {
      console.error(
        `[createShippingLabel] No label URL in transaction response:`,
        transaction
      );
      return {
        error: "Failed to create shipping label - no label URL returned",
      };
    }

    // Get tracking info from the transaction
    const trackingNumber = transaction.tracking_number;
    const labelUrl = transaction.label_url;
    const carrierAccount = transaction.rate?.carrier_account;
    const labelBrokerQRCodeUrl = transaction.qr_code_url;

    console.log(
      `[createShippingLabel] Label created successfully: ${labelUrl}`
    );
    console.log(`[createShippingLabel] Tracking number: ${trackingNumber}`);
    if (labelBrokerQRCodeUrl) {
      console.log(
        `[createShippingLabel] Label Broker QR Code URL: ${labelBrokerQRCodeUrl}`
      );
    }

    // Update order with label information
    const updateData = {
      shippingLabelUrl: labelUrl,
      trackingNumber: trackingNumber,
      shippoTransactionId: transaction.object_id,
      carrierAccount: carrierAccount,
      orderStatus: "shipped",
      shippedAt: new Date(),
      ...(labelBrokerQRCodeUrl && {
        labelBrokerQRCodeUrl: labelBrokerQRCodeUrl,
      }),
    };

    console.log(`[createShippingLabel] Updating order with data:`, updateData);

    const updateResult = await update({
      col: "storeitemsorders",
      data: { _id: order._id },
      update: updateData,
    });

    console.log(`[createShippingLabel] Update result:`, updateResult);

    if (updateResult.error) {
      console.error(
        "[createShippingLabel] Error updating order with label info:",
        updateResult.error
      );
      return { error: "Failed to update order with label information" };
    }

    console.log(
      `[createShippingLabel] Order ${order.orderNumber} updated with shipping label info`
    );

    // Verify the update by fetching the order again
    const updatedOrder = await getOne({
      col: "storeitemsorders",
      data: { _id: order._id },
    });

    console.log(
      `[createShippingLabel] Verification - Updated order shippingLabelUrl: ${updatedOrder?.shippingLabelUrl}`
    );

    if (!updatedOrder?.shippingLabelUrl) {
      console.error(
        `[createShippingLabel] Verification failed - shippingLabelUrl not saved to database`
      );
      return { error: "Label created but failed to save to database" };
    }

    return {
      success: true,
      label: {
        url: labelUrl,
        trackingNumber: trackingNumber,
        transactionId: transaction.object_id,
        labelBrokerQRCodeUrl: labelBrokerQRCodeUrl,
      },
    };
  } catch (error) {
    console.error(
      "[createShippingLabel] Error creating shipping label:",
      error
    );
    return { error: error.message || "Failed to create shipping label" };
  }
};

// Create or get Label Broker QR Code
export const createLabelBrokerQRCode = async ({ orderId }) => {
  try {
    console.log(`[createLabelBrokerQRCode] Starting for orderId: ${orderId}`);

    const { mongoUser } = await getMongoUser();
    if (!mongoUser?._id) {
      console.error("[createLabelBrokerQRCode] User not authenticated");
      return { error: "User not authenticated" };
    }

    console.log(
      `[createLabelBrokerQRCode] User authenticated: ${mongoUser._id}`
    );

    // Get the order
    const order = await getOne({
      col: "storeitemsorders",
      data: {
        _id: orderId,
        createdBy: mongoUser._id,
      },
    });

    if (!order) {
      console.error(
        `[createLabelBrokerQRCode] Order not found for ID: ${orderId}`
      );
      return { error: "Order not found" };
    }

    console.log(`[createLabelBrokerQRCode] Order found: ${order.orderNumber}`);

    if (!order.shippoTransactionId) {
      console.error(
        `[createLabelBrokerQRCode] No transaction ID for order: ${order.orderNumber}`
      );
      return { error: "Order must have a shipping label created first" };
    }

    // Check if QR code already exists
    if (order.labelBrokerQRCodeUrl) {
      console.log(
        `[createLabelBrokerQRCode] QR code already exists: ${order.labelBrokerQRCodeUrl}`
      );
      return {
        success: true,
        qrCode: {
          url: order.labelBrokerQRCodeUrl,
        },
      };
    }

    console.log(
      `[createLabelBrokerQRCode] Getting Label Broker QR Code for transaction ${order.shippoTransactionId}`
    );

    try {
      // Get Label Broker QR Code from Shippo
      const qrCodeUrl = await shippoService.getLabelBrokerQRCode(
        order.shippoTransactionId
      );

      if (!qrCodeUrl) {
        console.error(
          `[createLabelBrokerQRCode] No QR code URL returned for transaction: ${order.shippoTransactionId}`
        );
        return {
          error: "Failed to get Label Broker QR Code - no QR code URL returned",
        };
      }

      console.log(
        `[createLabelBrokerQRCode] QR code retrieved successfully: ${qrCodeUrl}`
      );

      // Update order with QR code information
      const updateData = {
        labelBrokerQRCodeUrl: qrCodeUrl,
      };

      console.log(
        `[createLabelBrokerQRCode] Updating order with data:`,
        updateData
      );

      const updateResult = await update({
        col: "storeitemsorders",
        data: { _id: order._id },
        update: updateData,
      });

      console.log(`[createLabelBrokerQRCode] Update result:`, updateResult);

      if (updateResult.error) {
        console.error(
          "[createLabelBrokerQRCode] Error updating order with QR code info:",
          updateResult.error
        );
        return { error: "Failed to update order with QR code information" };
      }

      console.log(
        `[createLabelBrokerQRCode] Order ${order.orderNumber} updated with Label Broker QR code info`
      );

      return {
        success: true,
        qrCode: {
          url: qrCodeUrl,
        },
      };
    } catch (qrError) {
      console.log(
        `[createLabelBrokerQRCode] QR code not available in existing transaction: ${qrError.message}`
      );

      // For older orders that don't have QR codes, we need to inform the user
      return {
        error:
          "QR code not available for this order. QR codes are only available for orders created after the QR code feature was enabled. Please contact support if you need assistance with printing your shipping label.",
      };
    }
  } catch (error) {
    console.error(
      "[createLabelBrokerQRCode] Error creating Label Broker QR Code:",
      error
    );
    return { error: error.message || "Failed to create Label Broker QR Code" };
  }
};

// Get order shipment details
export const getOrderShipmentDetails = async ({ orderId }) => {
  try {
    const { mongoUser } = await getMongoUser();
    if (!mongoUser?._id) {
      return { error: "User not authenticated" };
    }

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

    return {
      success: true,
      shipment: {
        hasShipment: !!order.shippoShipmentId,
        hasLabel: !!order.shippingLabelUrl,
        hasLabelBrokerQR: !!order.labelBrokerQRCodeUrl,
        shipmentId: order.shippoShipmentId,
        rates: order.shippoRates || [],
        labelUrl: order.shippingLabelUrl,
        labelBrokerQRCodeUrl: order.labelBrokerQRCodeUrl,
        trackingNumber: order.trackingNumber,
        transactionId: order.shippoTransactionId,
      },
    };
  } catch (error) {
    console.error("Error getting shipment details:", error);
    return { error: error.message || "Failed to get shipment details" };
  }
};
