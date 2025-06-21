import { NextResponse } from "next/server";
import Stripe from "stripe";
import { redirect } from "next/navigation";
import { add, update } from "@/lib/actions/crud";
import { processStripeConnectTransfers } from "@/lib/actions/processStripeConnectTransfers";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import shippoService from "@/lib/utils/shippo/shippoService";
import { getStoreOwnerShippingAddress } from "@/lib/actions/getStoreOwnerShippingAddress";
import { sendAuctionWinnerPaymentNotificationToStoreOwner } from "@/lib/actions/emailNotifications";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      console.error("No session ID provided");
      return redirect("/");
    }

    // Get mongo user
    const { mongoUser } = await getMongoUser();
    if (!mongoUser?._id) {
      console.error("User not authenticated");
      return redirect("/");
    }

    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Verify session is valid and paid
    if (session.payment_status !== "paid") {
      console.error("Payment not completed:", session.payment_status);
      return redirect("/");
    }

    // Extract auction data from session metadata
    const {
      auctionItemId,
      storeOwnerId,
      winningAmount,
      shippingCost,
      totalAmount,
      platformFee,
      originalAmount,
      shippingAddress,
      shippingRate,
      stripeAccount,
    } = session.metadata;

    if (!auctionItemId || !storeOwnerId || !winningAmount) {
      console.error("Missing required metadata in session");
      return redirect("/");
    }

    // Parse shipping information
    let parsedShippingAddress = null;
    let parsedShippingRate = null;

    try {
      if (shippingAddress) {
        parsedShippingAddress = JSON.parse(shippingAddress);
      }
      if (shippingRate) {
        parsedShippingRate = JSON.parse(shippingRate);
      }
    } catch (parseError) {
      console.error("Error parsing shipping data:", parseError);
    }

    console.log(
      "🏆 Processing auction winner payment success for:",
      auctionItemId
    );

    // Create order record for the auction winner payment
    const orderData = {
      createdBy: mongoUser._id,
      storeOwner: storeOwnerId,
      items: [
        {
          storeItemId: auctionItemId,
          quantity: 1,
          priceAtTime: parseFloat(winningAmount),
          title: `Auction Won`,
          category: "Auction",
          stockAtTime: 1, // Auction items are unique
        },
      ],
      subtotal: parseFloat(winningAmount),
      tax: 0,
      shipping: parseFloat(shippingCost) || 0,
      total: parseFloat(totalAmount) || parseFloat(winningAmount),
      stripeSessionId: sessionId,
      stripePaymentIntentId: session.payment_intent,
      paymentStatus: "paid",
      orderStatus: "processing", // Start as processing since payment is complete
      shippingAddress: parsedShippingAddress,
      shippingRate: parsedShippingRate,
      platformFee: parseFloat(platformFee) / 100 || 0, // Convert from cents
      transferAmount:
        (parseFloat(originalAmount) - parseFloat(platformFee)) / 100 || 0, // Convert from cents
      transferStatus: "pending",
      metadata: {
        auctionWinnerPayment: true,
        originalSessionId: sessionId,
        auctionCompleted: true,
      },
    };

    const order = await add({
      col: "storeitemsorders",
      data: orderData,
    });

    if (order.error) {
      console.error("Failed to create order:", order.error);
      // Don't fail the process, continue with transfer
    } else {
      console.log("🏆 Auction winner payment order created:", order._id);
    }

    // Create shipping label if order was created successfully
    if (order && !order.error && parsedShippingAddress) {
      try {
        console.log("🏆 Creating shipping label for auction winner order...");

        // Get store owner's shipping address
        const storeOwnerAddressResult = await getStoreOwnerShippingAddress({
          storeOwnerId: storeOwnerId,
        });

        let storeOwnerShippingAddress = null;

        if (storeOwnerAddressResult.error) {
          console.log(
            "❌ Store owner shipping address error:",
            storeOwnerAddressResult.error
          );
          // Continue without shipping label - can be created later
        } else if (storeOwnerAddressResult.success) {
          storeOwnerShippingAddress = storeOwnerAddressResult.shippingAddress;
          console.log(
            "✅ Using store owner's shipping address for auction shipment creation"
          );
        }

        // Create Shippo shipment if we have store owner address
        if (storeOwnerShippingAddress) {
          const shipment = await shippoService.createShipment(
            order,
            storeOwnerShippingAddress
          );

          // Create shipping label with cheapest USPS rate
          let shippingLabelUrl = null;
          let trackingNumber = null;
          let shippoTransactionId = null;
          let carrierAccount = "USPS";
          let labelBrokerQRCodeUrl = null;

          if (shipment.rates && shipment.rates.length > 0) {
            try {
              console.log(
                `🏆 Creating shipping label for auction order ${order.orderNumber}`
              );
              const cheapestRate = shippoService.getCheapestRate(
                shipment.rates
              );
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
                  `✅ Auction shipping label created for order ${order.orderNumber}: ${shippingLabelUrl}`
                );
                console.log(`✅ Carrier: ${carrierAccount}`);

                // Get Label Broker QR Code URL if available
                if (transaction.qr_code_url) {
                  labelBrokerQRCodeUrl = transaction.qr_code_url;
                  console.log(
                    `✅ Label Broker QR Code available for auction order ${order.orderNumber}: ${labelBrokerQRCodeUrl}`
                  );
                }
              }
            } catch (labelError) {
              console.error(
                `❌ Error creating shipping label for auction order ${order.orderNumber}:`,
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
              carrierAccount: carrierAccount,
              ...(shippingLabelUrl && {
                shippingLabelUrl: shippingLabelUrl,
                trackingNumber: trackingNumber,
                shippoTransactionId: shippoTransactionId,
                ...(labelBrokerQRCodeUrl && {
                  labelBrokerQRCodeUrl: labelBrokerQRCodeUrl,
                }),
              }),
            },
            skipOwnershipCheck: true, // System operation
          });

          if (updateResult.error) {
            console.error(
              "❌ Error updating auction order with shipment info:",
              updateResult.error
            );
          } else {
            console.log(
              `✅ Auction shipment created for order ${order.orderNumber}: ${shipment.object_id}`
            );
            console.log(`✅ Carrier account set to: ${carrierAccount}`);
            if (shippingLabelUrl) {
              console.log(`✅ Shipping label URL saved: ${shippingLabelUrl}`);
            }
          }
        }
      } catch (shippoError) {
        console.error(
          `❌ Error creating Shippo shipment for auction order:`,
          shippoError
        );
        // Continue without shipping label - can be created later
      }
    }

    // Send auction winner payment notification to store owner
    if (order && !order.error) {
      try {
        console.log(
          `🏆 Sending auction winner payment notification to store owner for order ${order.orderNumber}`
        );
        const notificationResult =
          await sendAuctionWinnerPaymentNotificationToStoreOwner({
            orderId: order._id,
          });

        if (notificationResult.error) {
          console.error(
            `❌ Failed to send auction payment notification:`,
            notificationResult.error
          );
          // Don't fail the process if notification fails
        } else {
          console.log(
            `✅ Auction payment notification sent for order ${order.orderNumber}`
          );
        }
      } catch (notificationError) {
        console.error(
          `❌ Error sending auction payment notification:`,
          notificationError
        );
        // Don't fail the process if notification fails
      }
    }

    // Process Stripe Connect transfer to store owner (if applicable)
    if (stripeAccount && order && !order.error) {
      try {
        await processStripeConnectTransfers([
          {
            orderId: order._id,
            storeOwnerId,
            stripeAccountId: stripeAccount,
            amount: parseFloat(originalAmount) - parseFloat(platformFee), // Amount in cents
            platformFee: parseFloat(platformFee), // Platform fee in cents
          },
        ]);

        console.log(
          "🏆 Stripe Connect transfer initiated for auction winner payment"
        );
      } catch (transferError) {
        console.error(
          "Transfer failed but payment was successful:",
          transferError
        );
        // Don't fail the success flow - transfers can be retried
      }
    }

    // Redirect to success page with order information
    const redirectUrl =
      order && !order.error
        ? `/orders?highlight=${order._id}&auction_payment_success=true`
        : `/orders?auction_payment_success=true`;

    return redirect(redirectUrl);
  } catch (error) {
    console.error("❌ Auction winner payment success processing error:", error);
    // Redirect to orders page even on error - payment was successful
    return redirect("/orders?auction_payment_success=true&error=processing");
  }
}
