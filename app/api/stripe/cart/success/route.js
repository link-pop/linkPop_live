export const dynamic = "force-dynamic";
("use server");

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { models } from "@/lib/db/models/models";
import { connectToDb } from "@/lib/db/connectToDb";
import { update } from "@/lib/actions/crud";
import { clearUserCart } from "@/lib/actions/userCartActions";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import { processCartItems } from "@/lib/actions/processCartItems";
import { createMultipleStoreItemsOrders } from "@/lib/actions/createStoreItemsOrder";
import { createShippoShipmentsForOrders } from "@/lib/actions/createShippoShipment";
import { processStripeConnectTransfers } from "@/lib/actions/processStripeConnectTransfers";
import { updateMultipleStoreItemsStock } from "@/lib/actions/updateStoreItemStock";
import { sendOrderPurchaseNotificationToStoreOwner } from "@/lib/actions/emailNotifications";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      console.error("No session_id provided");
      return NextResponse.redirect(
        new URL("/cart?error=missing_session", request.url)
      );
    }

    console.log("Processing payment success for session:", sessionId);

    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });

    if (!session) {
      console.error("Session not found:", sessionId);
      return NextResponse.redirect(
        new URL("/cart?error=session_not_found", request.url)
      );
    }

    console.log("Stripe session retrieved:", {
      id: session.id,
      payment_status: session.payment_status,
      payment_intent: session.payment_intent?.id,
    });

    // Check if payment was successful
    if (session.payment_status !== "paid") {
      console.error("Payment not completed:", session.payment_status);
      return NextResponse.redirect(
        new URL("/cart?error=payment_not_completed", request.url)
      );
    }

    // Connect to database
    await connectToDb();

    // Check if orders already exist for this session
    const existingOrders = await models.storeitemsorders
      .find({
        stripeSessionId: sessionId,
      })
      .lean();

    if (existingOrders && existingOrders.length > 0) {
      console.log(
        `Orders already exist for session ${sessionId}, redirecting to success page`
      );
      return NextResponse.redirect(
        new URL(`/cart/success?session_id=${sessionId}`, request.url)
      );
    }

    // Process cart items to get order data
    const cartResult = await processCartItems();

    if (cartResult.error) {
      console.error("Cart processing error:", cartResult.error);
      return NextResponse.redirect(
        new URL("/cart?error=cart_processing_failed", request.url)
      );
    }

    const { allOrders } = cartResult;

    // Calculate final total from Stripe session
    const finalTotal = session.amount_total / 100; // Convert from cents to dollars
    const tax = (session.total_details?.amount_tax || 0) / 100;

    // Get shipping cost from session metadata (since total_details.amount_shipping is not reliable)
    const shippingCostFromMetadata = parseFloat(
      session.metadata?.shippingCost || "0"
    );
    const shipping = shippingCostFromMetadata;

    // Get shipping address from session metadata (collected in our form)
    let shippingAddress;
    try {
      shippingAddress = session.metadata?.shippingAddress
        ? JSON.parse(session.metadata.shippingAddress)
        : {
            // Add dummy shipping address for Shippo shipment creation if no real address
            name: "John Doe",
            line1: "1600 Amphitheatre Parkway",
            line2: "",
            city: "Mountain View",
            state: "CA",
            postal_code: "94043",
            country: "US",
          };
    } catch (error) {
      console.error("Error parsing shipping address from metadata:", error);
      shippingAddress = {
        // Fallback dummy shipping address
        name: "John Doe",
        line1: "1600 Amphitheatre Parkway",
        line2: "",
        city: "Mountain View",
        state: "CA",
        postal_code: "94043",
        country: "US",
      };
    }

    // Create orders with paid status since payment is confirmed
    const orderCreationResult = await createMultipleStoreItemsOrders({
      allOrders,
      stripeSessionId: sessionId,
      shippingAddress: shippingAddress,
      paymentStatus: "paid",
      orderStatus: "processing",
    });

    if (orderCreationResult.error) {
      console.error("Error creating orders:", orderCreationResult.error);
      return NextResponse.redirect(
        new URL("/cart?error=order_creation_failed", request.url)
      );
    }

    const createdOrders = orderCreationResult.orders;
    console.log(`✅ ${createdOrders.length} orders created successfully`);

    // Update stock for all purchased items
    try {
      console.log("Updating stock for purchased items...");

      // Collect all items from all orders for stock update
      const allPurchasedItems = [];
      createdOrders.forEach((order) => {
        order.items.forEach((item) => {
          allPurchasedItems.push({
            storeItemId: item.storeItemId,
            quantity: item.quantity,
          });
        });
      });

      const stockUpdateResult = await updateMultipleStoreItemsStock(
        allPurchasedItems
      );

      if (stockUpdateResult.error) {
        console.error("Error updating stock:", stockUpdateResult.error);
        // Continue anyway - orders are created, stock can be manually adjusted
      } else {
        console.log(
          `✅ Stock updated for ${stockUpdateResult.updatedItems} items`
        );
      }
    } catch (stockError) {
      console.error("Error in stock update process:", stockError);
      // Continue anyway - orders are created, stock can be manually adjusted
    }

    // Update orders with final payment details
    const updatePromises = createdOrders.map(async (order) => {
      // Calculate proportional amounts for each order based on subtotal
      const orderProportion =
        order.subtotal / createdOrders.reduce((sum, o) => sum + o.subtotal, 0);
      const orderTax = tax * orderProportion;
      const orderShipping = shipping * orderProportion;
      const orderTotal = order.subtotal + orderTax + orderShipping;

      return update({
        col: "storeitemsorders",
        data: { _id: order._id },
        update: {
          stripePaymentIntentId: session.payment_intent?.id,
          total: orderTotal,
          tax: orderTax,
          shipping: orderShipping,
        },
      });
    });

    const updateResults = await Promise.allSettled(updatePromises);

    // Check for any failed updates
    const failedUpdates = updateResults.filter(
      (result) => result.status === "rejected" || result.value?.error
    );

    if (failedUpdates.length > 0) {
      console.error("Some order updates failed:", failedUpdates);
      // Continue anyway - partial success is better than complete failure
    }

    const successfulUpdates = updateResults.filter(
      (result) => result.status === "fulfilled" && !result.value?.error
    );

    console.log(
      `✅ ${successfulUpdates.length} orders updated with payment details`
    );

    // Create Shippo shipments for all orders
    try {
      console.log("Creating Shippo shipments for orders...");
      const shippoResult = await createShippoShipmentsForOrders(createdOrders);

      if (shippoResult.error) {
        console.error("Error creating Shippo shipments:", shippoResult.error);
        // Continue anyway - orders are created, shipping can be handled later
      } else {
        console.log(
          `✅ Shippo shipments processed for ${createdOrders.length} orders`
        );
      }
    } catch (shippoError) {
      console.error("Error in Shippo shipment creation:", shippoError);
      // Continue anyway - orders are created, shipping can be handled later
    }

    // Process Stripe Connect transfers for platform fees
    try {
      console.log("Processing Stripe Connect transfers...");
      const transferResult = await processStripeConnectTransfers({
        orders: createdOrders,
        stripeSessionId: sessionId,
      });

      if (transferResult.error) {
        console.error(
          "Error processing Stripe Connect transfers:",
          transferResult.error
        );
        // Continue anyway - orders are created, transfers can be retried later
      } else {
        console.log(
          `✅ Stripe Connect transfers processed: ${transferResult.successfulTransfers} successful, ${transferResult.failedTransfers} failed`
        );
      }
    } catch (transferError) {
      console.error(
        "Error in Stripe Connect transfer processing:",
        transferError
      );
      // Continue anyway - orders are created, transfers can be retried later
    }

    // Send purchase notifications to store owners
    try {
      console.log("Sending purchase notifications to store owners...");
      const notificationPromises = createdOrders.map(async (order) => {
        try {
          const result = await sendOrderPurchaseNotificationToStoreOwner({
            orderId: order._id,
          });
          if (result.error) {
            console.error(
              `❌ Failed to send notification for order ${order.orderNumber}:`,
              result.error
            );
          } else {
            console.log(
              `✅ Purchase notification sent for order ${order.orderNumber}`
            );
          }
          return result;
        } catch (error) {
          console.error(
            `❌ Error sending notification for order ${order.orderNumber}:`,
            error
          );
          return { error: error.message };
        }
      });

      const notificationResults = await Promise.allSettled(
        notificationPromises
      );
      const successfulNotifications = notificationResults.filter(
        (result) => result.status === "fulfilled" && result.value?.success
      );

      console.log(
        `✅ ${successfulNotifications.length}/${createdOrders.length} purchase notifications sent successfully`
      );
    } catch (notificationError) {
      console.error(
        "Error in purchase notification process:",
        notificationError
      );
      // Continue anyway - orders are created, notifications are not critical
    }

    // Clear user's cart after successful payment and order creation
    try {
      const { mongoUser } = await getMongoUser();
      if (
        mongoUser &&
        mongoUser._id.toString() === createdOrders[0].createdBy.toString()
      ) {
        const clearResult = await clearUserCart();
        if (clearResult.error) {
          console.warn("Cart clearing warning:", clearResult.error);
        } else {
          console.log(`✅ Cart cleared for user ${mongoUser._id}`);
        }
      }
    } catch (cartError) {
      console.error("Error clearing cart:", cartError);
      // Don't fail the success flow if cart clearing fails
    }

    // Redirect to success page
    return NextResponse.redirect(
      new URL(`/cart/success?session_id=${sessionId}`, request.url)
    );
  } catch (error) {
    console.error("Cart success processing error:", error);
    return NextResponse.redirect(
      new URL("/cart?error=processing_failed", request.url)
    );
  }
}
