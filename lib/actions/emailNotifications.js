"use server";

import mailer from "@/lib/utils/mailer/mailer";
import { getOne } from "./crud";
import {
  generateTrackingNumberDisplay,
  generateEmailTrackingSection,
} from "@/lib/utils/email/generateUSPSTrackingLink";

// Send email notification to store owner when someone buys their item
export const sendOrderPurchaseNotificationToStoreOwner = async ({
  orderId,
}) => {
  try {
    // Get order with populated data
    const order = await getOne({
      col: "storeitemsorders",
      data: { _id: orderId },
      populate: [
        {
          path: "items.storeItemId",
          populate: {
            path: "files",
          },
        },
        "storeOwner",
        "createdBy",
      ],
    });

    if (!order) {
      console.error("❌ Order not found for purchase notification:", orderId);
      return { error: "Order not found" };
    }

    const storeOwner = order.storeOwner;
    const buyer = order.createdBy;

    if (!storeOwner?.email) {
      console.error("❌ Store owner email not found:", storeOwner);
      return { error: "Store owner email not found" };
    }

    // Create email content
    const itemsList = order.items
      .map(
        (item) =>
          `• ${item.title || item.storeItemId?.title || "Store Item"} (Qty: ${
            item.quantity
          }) - $${(item.priceAtTime * item.quantity).toFixed(2)}`
      )
      .join("\n");

    const emailSubject = `🎉 New Order Received - ${order.orderNumber}`;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h1 style="color: #2563eb; margin-bottom: 20px; text-align: center;">🎉 New Order Received!</h1>
          
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1e40af; margin-top: 0;">Order Details</h2>
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Order Date:</strong> ${new Date(
              order.createdAt
            ).toLocaleDateString()}</p>
            <p><strong>Total Amount:</strong> $${order.total.toFixed(2)}</p>
          </div>

          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #374151; margin-top: 0;">Items Ordered:</h3>
            <pre style="font-family: Arial, sans-serif; white-space: pre-wrap; margin: 0;">${itemsList}</pre>
          </div>

          ${
            order.shippingAddress
              ? `
          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #92400e; margin-top: 0;">📦 Shipping Address:</h3>
            <p style="margin: 0;">
              ${order.shippingAddress.name}<br>
              ${order.shippingAddress.line1}<br>
              ${
                order.shippingAddress.line2
                  ? order.shippingAddress.line2 + "<br>"
                  : ""
              }
              ${order.shippingAddress.city}, ${order.shippingAddress.state} ${
                  order.shippingAddress.postal_code
                }<br>
              ${order.shippingAddress.country}
            </p>
          </div>
          `
              : ""
          }

          <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #065f46; margin-top: 0;">📋 Next Steps:</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Log in to your account to view the full order details</li>
              <li>Prepare the items for shipping</li>
              <li>Create a shipping label when ready to ship</li>
              <li>The customer will be notified automatically when you ship the order</li>
            </ul>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_CLIENT_URL}/orders" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Order Details
            </a>
          </div>

          <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 30px;">
            Thank you for using our platform! 🚀
          </p>
        </div>
      </div>
    `;

    // Send email
    const result = await mailer({
      toEmail: storeOwner.email,
      fromEmail: process.env.SMTP_ADMIN_EMAIL,
      subject: emailSubject,
      html: emailHtml,
    });

    console.log(
      `✅ Purchase notification sent to store owner: ${storeOwner.email}`
    );
    return { success: true, result };
  } catch (error) {
    console.error(
      "❌ Error sending purchase notification to store owner:",
      error
    );
    return { error: error.message || "Failed to send purchase notification" };
  }
};

// Send email notification to buyer when order is shipped
export const sendOrderShippedNotificationToBuyer = async ({ orderId }) => {
  try {
    // Get order with populated data
    const order = await getOne({
      col: "storeitemsorders",
      data: { _id: orderId },
      populate: [
        {
          path: "items.storeItemId",
          populate: {
            path: "files",
          },
        },
        "storeOwner",
        "createdBy",
      ],
    });

    if (!order) {
      console.error("❌ Order not found for shipping notification:", orderId);
      return { error: "Order not found" };
    }

    // Check if this is an auction order and delegate to auction-specific notification
    const isAuctionOrder =
      order.metadata?.auctionWinnerPayment || order.metadata?.auctionBuyNow;
    if (isAuctionOrder) {
      return await sendAuctionOrderShippedNotificationToBuyer({ orderId });
    }

    const buyer = order.createdBy;
    const storeOwner = order.storeOwner;

    if (!buyer?.email) {
      console.error("❌ Buyer email not found:", buyer);
      return { error: "Buyer email not found" };
    }

    // Create email content
    const itemsList = order.items
      .map(
        (item) =>
          `• ${item.title || item.storeItemId?.title || "Store Item"} (Qty: ${
            item.quantity
          })`
      )
      .join("\n");

    const emailSubject = `📦 Your Order Has Been Shipped - ${order.orderNumber}`;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h1 style="color: #059669; margin-bottom: 20px; text-align: center;">📦 Your Order Has Been Shipped!</h1>
          
          <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #065f46; margin-top: 0;">Shipping Details</h2>
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Shipped Date:</strong> ${new Date(
              order.shippedAt || order.updatedAt
            ).toLocaleDateString()}</p>
            ${generateTrackingNumberDisplay(order.trackingNumber)}
            ${
              order.carrierAccount
                ? `<p><strong>Carrier:</strong> ${order.carrierAccount}</p>`
                : ""
            }
          </div>

          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #374151; margin-top: 0;">Items Shipped:</h3>
            <pre style="font-family: Arial, sans-serif; white-space: pre-wrap; margin: 0;">${itemsList}</pre>
          </div>

          ${
            order.shippingAddress
              ? `
          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #92400e; margin-top: 0;">📍 Shipping To:</h3>
            <p style="margin: 0;">
              ${order.shippingAddress.name}<br>
              ${order.shippingAddress.line1}<br>
              ${
                order.shippingAddress.line2
                  ? order.shippingAddress.line2 + "<br>"
                  : ""
              }
              ${order.shippingAddress.city}, ${order.shippingAddress.state} ${
                  order.shippingAddress.postal_code
                }<br>
              ${order.shippingAddress.country}
            </p>
          </div>
          `
              : ""
          }

          ${generateEmailTrackingSection(order.trackingNumber, "shipped")}

          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1e40af; margin-top: 0;">📋 What's Next:</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Your package is on its way!</li>
              <li>You'll receive delivery confirmation once it arrives</li>
              <li>If you have any questions, contact the store owner</li>
              <li>You can view your order details anytime in your account</li>
            </ul>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_CLIENT_URL}/orders" 
               style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Order Details
            </a>
          </div>

          <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 30px;">
            Thank you for your purchase! 🎉
          </p>
        </div>
      </div>
    `;

    // Send email
    const result = await mailer({
      toEmail: buyer.email,
      fromEmail: process.env.SMTP_ADMIN_EMAIL,
      subject: emailSubject,
      html: emailHtml,
    });

    console.log(`✅ Shipping notification sent to buyer: ${buyer.email}`);
    return { success: true, result };
  } catch (error) {
    console.error("❌ Error sending shipping notification to buyer:", error);
    return { error: error.message || "Failed to send shipping notification" };
  }
};

// Send email notification to store owner when order is cancelled
export const sendOrderCancelledNotificationToStoreOwner = async ({
  orderId,
}) => {
  try {
    // Get order with populated data
    const order = await getOne({
      col: "storeitemsorders",
      data: { _id: orderId },
      populate: [
        {
          path: "items.storeItemId",
          populate: {
            path: "files",
          },
        },
        "storeOwner",
        "createdBy",
      ],
    });

    if (!order) {
      console.error(
        "❌ Order not found for cancellation notification:",
        orderId
      );
      return { error: "Order not found" };
    }

    const storeOwner = order.storeOwner;
    const buyer = order.createdBy;

    if (!storeOwner?.email) {
      console.error("❌ Store owner email not found:", storeOwner);
      return { error: "Store owner email not found" };
    }

    // Create email content
    const itemsList = order.items
      .map(
        (item) =>
          `• ${item.title || item.storeItemId?.title || "Store Item"} (Qty: ${
            item.quantity
          }) - $${(item.priceAtTime * item.quantity).toFixed(2)}`
      )
      .join("\n");

    const emailSubject = `❌ Order Cancelled - ${order.orderNumber}`;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h1 style="color: #dc2626; margin-bottom: 20px; text-align: center;">❌ Order Cancelled</h1>
          
          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #991b1b; margin-top: 0;">Cancellation Details</h2>
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Original Order Date:</strong> ${new Date(
              order.createdAt
            ).toLocaleDateString()}</p>
            <p><strong>Cancelled Date:</strong> ${new Date(
              order.cancelledAt || order.updatedAt
            ).toLocaleDateString()}</p>
            <p><strong>Refund Amount:</strong> $${
              order.refundAmount?.toFixed(2) || order.total.toFixed(2)
            }</p>
            <p><strong>Reason:</strong> ${
              order.cancelReason === "customer_request"
                ? "Customer Request"
                : order.cancelReason || "Customer Request"
            }</p>
          </div>

          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #374151; margin-top: 0;">Cancelled Items:</h3>
            <pre style="font-family: Arial, sans-serif; white-space: pre-wrap; margin: 0;">${itemsList}</pre>
          </div>

          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #92400e; margin-top: 0;">⚠️ Important Information:</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>The customer has been refunded the full amount</li>
              <li>If you had already prepared items for shipping, you can return them to inventory</li>
              <li>No further action is required from your side</li>
              <li>The refund will be processed automatically by our payment system</li>
            </ul>
          </div>

          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1e40af; margin-top: 0;">📊 Impact on Your Store:</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>This cancellation will be reflected in your store earnings</li>
              <li>Stock levels for these items have been automatically restored</li>
              <li>You can view updated analytics in your store dashboard</li>
            </ul>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_CLIENT_URL}/orders" 
               style="background-color: #6b7280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View All Orders
            </a>
          </div>

          <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 30px;">
            We're sorry this order was cancelled. Keep up the great work! 💪
          </p>
        </div>
      </div>
    `;

    // Send email
    const result = await mailer({
      toEmail: storeOwner.email,
      fromEmail: process.env.SMTP_ADMIN_EMAIL,
      subject: emailSubject,
      html: emailHtml,
    });

    console.log(
      `✅ Cancellation notification sent to store owner: ${storeOwner.email}`
    );
    return { success: true, result };
  } catch (error) {
    console.error(
      "❌ Error sending cancellation notification to store owner:",
      error
    );
    return {
      error: error.message || "Failed to send cancellation notification",
    };
  }
};

// Send email notification to buyer when order is delivered (optional)
export const sendOrderDeliveredNotificationToBuyer = async ({ orderId }) => {
  try {
    // Get order with populated data
    const order = await getOne({
      col: "storeitemsorders",
      data: { _id: orderId },
      populate: [
        {
          path: "items.storeItemId",
          populate: {
            path: "files",
          },
        },
        "storeOwner",
        "createdBy",
      ],
    });

    if (!order) {
      console.error("❌ Order not found for delivery notification:", orderId);
      return { error: "Order not found" };
    }

    const buyer = order.createdBy;
    const storeOwner = order.storeOwner;

    if (!buyer?.email) {
      console.error("❌ Buyer email not found:", buyer);
      return { error: "Buyer email not found" };
    }

    // Create email content
    const itemsList = order.items
      .map(
        (item) =>
          `• ${item.title || item.storeItemId?.title || "Store Item"} (Qty: ${
            item.quantity
          })`
      )
      .join("\n");

    const emailSubject = `✅ Order Delivered - ${order.orderNumber}`;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h1 style="color: #059669; margin-bottom: 20px; text-align: center;">✅ Order Delivered!</h1>
          
          <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #065f46; margin-top: 0;">Delivery Confirmation</h2>
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Delivered Date:</strong> ${new Date(
              order.deliveredAt || order.updatedAt
            ).toLocaleDateString()}</p>
            ${generateTrackingNumberDisplay(order.trackingNumber)}
          </div>

          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #374151; margin-top: 0;">Items Delivered:</h3>
            <pre style="font-family: Arial, sans-serif; white-space: pre-wrap; margin: 0;">${itemsList}</pre>
          </div>

          ${generateEmailTrackingSection(order.trackingNumber, "delivered")}

          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1e40af; margin-top: 0;">Thank You!</h3>
            <p>We hope you're satisfied with your purchase. If you have any questions or concerns, please don't hesitate to contact us.</p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_CLIENT_URL}/orders" 
               style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Order Details
            </a>
          </div>

          <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 30px;">
            Thank you for your business! 🚀
          </p>
        </div>
      </div>
    `;

    // Send email
    const result = await mailer({
      toEmail: buyer.email,
      fromEmail: process.env.SMTP_ADMIN_EMAIL,
      subject: emailSubject,
      html: emailHtml,
    });

    console.log(`✅ Delivery notification sent to buyer: ${buyer.email}`);
    return { success: true, result };
  } catch (error) {
    console.error("❌ Error sending delivery notification to buyer:", error);
    return { error: error.message || "Failed to send delivery notification" };
  }
};

// Send email notification to store owner when auction winner completes payment
export const sendAuctionWinnerPaymentNotificationToStoreOwner = async ({
  orderId,
}) => {
  try {
    // Get order with populated data
    const order = await getOne({
      col: "storeitemsorders",
      data: { _id: orderId },
      populate: [
        {
          path: "items.storeItemId",
          populate: {
            path: "files",
          },
        },
        "storeOwner",
        "createdBy",
      ],
    });

    if (!order) {
      console.error(
        "❌ Order not found for auction payment notification:",
        orderId
      );
      return { error: "Order not found" };
    }

    const storeOwner = order.storeOwner;
    const buyer = order.createdBy;

    if (!storeOwner?.email) {
      console.error("❌ Store owner email not found:", storeOwner);
      return { error: "Store owner email not found" };
    }

    // Check if this is an auction order
    const isAuctionOrder =
      order.metadata?.auctionWinnerPayment || order.metadata?.auctionBuyNow;
    if (!isAuctionOrder) {
      console.log(
        "❌ Order is not an auction order, skipping auction notification"
      );
      return { error: "Order is not an auction order" };
    }

    // Create email content
    const itemsList = order.items
      .map(
        (item) =>
          `• ${item.title || item.storeItemId?.title || "Auction Item"} - $${(
            item.priceAtTime * item.quantity
          ).toFixed(2)}`
      )
      .join("\n");

    const auctionType = order.metadata?.auctionBuyNow
      ? "Buy Now"
      : "Auction Winner";
    const emailSubject = `🏆 ${auctionType} Payment Received - ${order.orderNumber}`;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h1 style="color: #d97706; margin-bottom: 20px; text-align: center;">🏆 ${auctionType} Payment Received!</h1>
          
          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #92400e; margin-top: 0;">🎉 Congratulations!</h2>
            <p>Great news! The ${
              order.metadata?.auctionBuyNow
                ? "buyer has purchased your auction item using Buy Now"
                : "auction winner has completed their payment"
            }.</p>
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Payment Date:</strong> ${new Date(
              order.createdAt
            ).toLocaleDateString()}</p>
            <p><strong>Total Amount:</strong> $${order.total.toFixed(2)}</p>
          </div>

          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #374151; margin-top: 0;">Auction Item Sold:</h3>
            <pre style="font-family: Arial, sans-serif; white-space: pre-wrap; margin: 0;">${itemsList}</pre>
          </div>

          <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #065f46; margin-top: 0;">📦 Next Steps:</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Log in to your account to view the full order details</li>
              <li>Prepare the auction item for shipping</li>
              ${
                order.shippingAddress
                  ? `<li>The buyer has provided their shipping address</li>
                 <li>Create a shipping label when ready to ship</li>`
                  : `<li>Contact the buyer to arrange shipping details</li>`
              }
              <li>The buyer will be notified automatically when you ship the item</li>
            </ul>
          </div>

          ${
            order.shippingAddress
              ? `
          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #92400e; margin-top: 0;">📦 Shipping Address:</h3>
            <p style="margin: 0;">
              ${order.shippingAddress.name}<br>
              ${order.shippingAddress.line1}<br>
              ${
                order.shippingAddress.line2
                  ? order.shippingAddress.line2 + "<br>"
                  : ""
              }
              ${order.shippingAddress.city}, ${order.shippingAddress.state} ${
                  order.shippingAddress.postal_code
                }<br>
              ${order.shippingAddress.country}
            </p>
          </div>
          `
              : ""
          }

          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1e40af; margin-top: 0;">💰 Payment Details:</h3>
            <p><strong>Payment Status:</strong> ${
              order.paymentStatus.charAt(0).toUpperCase() +
              order.paymentStatus.slice(1)
            }</p>
            <p><strong>Winning Amount:</strong> $${order.subtotal.toFixed(
              2
            )}</p>
            ${
              order.shipping > 0
                ? `<p><strong>Shipping:</strong> $${order.shipping.toFixed(
                    2
                  )}</p>`
                : ""
            }
            <p><strong>Total Received:</strong> $${order.total.toFixed(2)}</p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_CLIENT_URL}/orders" 
               style="background-color: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Order Details
            </a>
          </div>

          <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 30px;">
            Congratulations on your successful auction sale! 🎉
          </p>
        </div>
      </div>
    `;

    // Send email
    const result = await mailer({
      toEmail: storeOwner.email,
      fromEmail: process.env.SMTP_ADMIN_EMAIL,
      subject: emailSubject,
      html: emailHtml,
    });

    console.log(
      `✅ Auction payment notification sent to store owner: ${storeOwner.email}`
    );
    return { success: true, result };
  } catch (error) {
    console.error(
      "❌ Error sending auction payment notification to store owner:",
      error
    );
    return {
      error: error.message || "Failed to send auction payment notification",
    };
  }
};

// Send email notification to buyer when auction order is shipped
export const sendAuctionOrderShippedNotificationToBuyer = async ({
  orderId,
}) => {
  try {
    // Get order with populated data
    const order = await getOne({
      col: "storeitemsorders",
      data: { _id: orderId },
      populate: [
        {
          path: "items.storeItemId",
          populate: {
            path: "files",
          },
        },
        "storeOwner",
        "createdBy",
      ],
    });

    if (!order) {
      console.error(
        "❌ Order not found for auction shipping notification:",
        orderId
      );
      return { error: "Order not found" };
    }

    const buyer = order.createdBy;
    const storeOwner = order.storeOwner;

    if (!buyer?.email) {
      console.error("❌ Buyer email not found:", buyer);
      return { error: "Buyer email not found" };
    }

    // This function should only be called for auction orders
    // The regular sendOrderShippedNotificationToBuyer function handles delegation

    // Create email content
    const itemsList = order.items
      .map(
        (item) => `• ${item.title || item.storeItemId?.title || "Auction Item"}`
      )
      .join("\n");

    const auctionType = order.metadata?.auctionBuyNow
      ? "Buy Now Purchase"
      : "Auction Win";
    const emailSubject = `📦 Your ${auctionType} Has Been Shipped - ${order.orderNumber}`;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h1 style="color: #059669; margin-bottom: 20px; text-align: center;">📦 Your ${auctionType} Has Been Shipped!</h1>
          
          <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #065f46; margin-top: 0;">🏆 Shipping Details</h2>
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Shipped Date:</strong> ${new Date(
              order.shippedAt || order.updatedAt
            ).toLocaleDateString()}</p>
            ${generateTrackingNumberDisplay(order.trackingNumber)}
            ${
              order.carrierAccount
                ? `<p><strong>Carrier:</strong> ${order.carrierAccount}</p>`
                : ""
            }
          </div>

          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #374151; margin-top: 0;">Auction Item Shipped:</h3>
            <pre style="font-family: Arial, sans-serif; white-space: pre-wrap; margin: 0;">${itemsList}</pre>
          </div>

          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #92400e; margin-top: 0;">🎉 Congratulations!</h3>
            <p>Your ${
              order.metadata?.auctionBuyNow ? "Buy Now purchase" : "auction win"
            } is on its way to you!</p>
            ${
              order.trackingNumber
                ? `<p>You can track your package using the tracking number above or click the tracking link below.</p>`
                : `<p>You should receive your item within the estimated delivery time.</p>`
            }
          </div>

          ${
            order.shippingAddress
              ? `
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1e40af; margin-top: 0;">📍 Shipping Address:</h3>
            <p style="margin: 0;">
              ${order.shippingAddress.name}<br>
              ${order.shippingAddress.line1}<br>
              ${
                order.shippingAddress.line2
                  ? order.shippingAddress.line2 + "<br>"
                  : ""
              }
              ${order.shippingAddress.city}, ${order.shippingAddress.state} ${
                  order.shippingAddress.postal_code
                }<br>
              ${order.shippingAddress.country}
            </p>
          </div>
          `
              : ""
          }

          ${generateEmailTrackingSection(order.trackingNumber, "auction")}

          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #374151; margin-top: 0;">📋 What's Next:</h3>
            <ul style="margin: 0; padding-left: 20px;">
              ${
                order.trackingNumber
                  ? `<li>Track your package using the USPS tracking link above</li>`
                  : `<li>Keep an eye out for your package delivery</li>`
              }
              <li>Contact the seller if you have any questions about your item</li>
              <li>You'll receive a delivery confirmation once your package arrives</li>
            </ul>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_CLIENT_URL}/orders" 
               style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Order Details
            </a>
          </div>

          <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 30px;">
            Thank you for participating in our auction! 🏆
          </p>
        </div>
      </div>
    `;

    // Send email
    const result = await mailer({
      toEmail: buyer.email,
      fromEmail: process.env.SMTP_ADMIN_EMAIL,
      subject: emailSubject,
      html: emailHtml,
    });

    console.log(
      `✅ Auction shipping notification sent to buyer: ${buyer.email}`
    );
    return { success: true, result };
  } catch (error) {
    console.error(
      "❌ Error sending auction shipping notification to buyer:",
      error
    );
    return {
      error: error.message || "Failed to send auction shipping notification",
    };
  }
};

// Send email notification to all auction participants when a new bid is placed
export const sendAuctionNewBidNotificationToParticipants = async ({
  auctionId,
  newBidAmount,
  newBidderId,
}) => {
  try {
    // Get auction with populated data
    const auction = await getOne({
      col: "storeitems",
      data: { _id: auctionId, type: "auction" },
      populate: [
        {
          path: "files",
        },
        {
          path: "createdBy", // Auction owner
        },
        {
          path: "auctionBids.bidderId", // All bidders
        },
        {
          path: "auctionCurrentBid.bidderId", // Current highest bidder
        },
      ],
    });

    if (!auction) {
      console.error("❌ Auction not found for bid notification:", auctionId);
      return { error: "Auction not found" };
    }

    // Get new bidder info
    const newBidder = await getOne({
      col: "users",
      data: { _id: newBidderId },
    });

    if (!newBidder) {
      console.error("❌ New bidder not found:", newBidderId);
      return { error: "New bidder not found" };
    }

    // Collect all unique participant emails (excluding the new bidder)
    const participantEmails = new Set();

    // Add auction owner (seller)
    if (
      auction.createdBy?.email &&
      auction.createdBy._id.toString() !== newBidderId.toString()
    ) {
      participantEmails.add(auction.createdBy.email);
    }

    // Add all previous bidders (excluding the new bidder)
    auction.auctionBids?.forEach((bid) => {
      if (
        bid.bidderId?.email &&
        bid.bidderId._id.toString() !== newBidderId.toString()
      ) {
        participantEmails.add(bid.bidderId.email);
      }
    });

    if (participantEmails.size === 0) {
      console.log("❌ No participants to notify for auction:", auctionId);
      return { success: true, message: "No participants to notify" };
    }

    // Calculate time remaining
    const now = new Date();
    const timeRemaining = Math.max(0, new Date(auction.auctionEndTime) - now);
    const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutesRemaining = Math.floor(
      (timeRemaining % (1000 * 60 * 60)) / (1000 * 60)
    );

    let timeRemainingText = "";
    if (hoursRemaining > 24) {
      const daysRemaining = Math.floor(hoursRemaining / 24);
      timeRemainingText = `${daysRemaining} day${
        daysRemaining > 1 ? "s" : ""
      } remaining`;
    } else if (hoursRemaining > 0) {
      timeRemainingText = `${hoursRemaining}h ${minutesRemaining}m remaining`;
    } else if (minutesRemaining > 0) {
      timeRemainingText = `${minutesRemaining} minute${
        minutesRemaining > 1 ? "s" : ""
      } remaining`;
    } else {
      timeRemainingText = "Ending soon!";
    }

    const emailSubject = `🔔 New Bid Alert: ${
      auction.title
    } - $${newBidAmount.toFixed(2)}`;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h1 style="color: #d97706; margin-bottom: 20px; text-align: center;">🔔 New Bid Alert!</h1>
          
          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #92400e; margin-top: 0;">📈 Auction Update</h2>
            <p><strong>Item:</strong> ${auction.title}</p>
            <p><strong>New Bid:</strong> $${newBidAmount.toFixed(2)}</p>
            <p><strong>Time Remaining:</strong> ${timeRemainingText}</p>
          </div>

          ${
            auction.files && auction.files.length > 0
              ? `
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${auction.files[0].fileUrl}" 
                 alt="${auction.title}" 
                 style="max-width: 300px; max-height: 200px; object-fit: cover; border-radius: 8px; border: 1px solid #e5e7eb;">
          </div>
          `
              : ""
          }

          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1e40af; margin-top: 0;">🏆 Current Auction Status</h3>
            <p><strong>Current Highest Bid:</strong> $${newBidAmount.toFixed(
              2
            )}</p>
            <p><strong>Starting Price:</strong> $${
              auction.auctionStartPrice?.toFixed(2) || "0.00"
            }</p>
            ${
              auction.auctionReservePrice
                ? `<p><strong>Reserve Price:</strong> $${auction.auctionReservePrice.toFixed(
                    2
                  )}</p>`
                : ""
            }
            ${
              auction.auctionBuyNowPrice
                ? `<p><strong>Buy Now Price:</strong> $${auction.auctionBuyNowPrice.toFixed(
                    2
                  )}</p>`
                : ""
            }
            <p><strong>Total Bids:</strong> ${
              auction.auctionBids?.length || 0
            }</p>
          </div>

          <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #065f46; margin-top: 0;">⚡ Don't Miss Out!</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>A new bid has been placed - you may have been outbid</li>
              <li>Place a higher bid to stay in the running</li>
              ${
                auction.auctionBuyNowPrice &&
                auction.auctionBuyNowPrice > newBidAmount
                  ? `<li>Use "Buy Now" at $${auction.auctionBuyNowPrice.toFixed(
                      2
                    )} to win instantly</li>`
                  : ""
              }
              <li>Auction ends in ${timeRemainingText.toLowerCase()}</li>
            </ul>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${
              process.env.NEXT_PUBLIC_CLIENT_URL
            }/storeitems/${auctionId}" 
               style="background-color: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 10px;">
              View Auction
            </a>
            <a href="${
              process.env.NEXT_PUBLIC_CLIENT_URL
            }/storeitems/${auctionId}" 
               style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Place Bid
            </a>
          </div>

          <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 30px;">
            Good luck with your bidding! 🍀
          </p>
        </div>
      </div>
    `;

    // Send emails to all participants
    const emailResults = [];

    for (const email of participantEmails) {
      try {
        const result = await mailer({
          toEmail: email,
          fromEmail: process.env.SMTP_ADMIN_EMAIL,
          subject: emailSubject,
          html: emailHtml,
        });

        emailResults.push({ email, success: true, result });
        console.log(`✅ Auction bid notification sent to: ${email}`);
      } catch (emailError) {
        console.error(
          `❌ Failed to send auction bid notification to ${email}:`,
          emailError
        );
        emailResults.push({ email, success: false, error: emailError.message });
      }
    }

    const successCount = emailResults.filter((r) => r.success).length;
    const failCount = emailResults.filter((r) => !r.success).length;

    console.log(
      `✅ Auction bid notifications sent: ${successCount} successful, ${failCount} failed`
    );

    return {
      success: true,
      sentCount: successCount,
      failedCount: failCount,
      results: emailResults,
    };
  } catch (error) {
    console.error("❌ Error sending auction bid notifications:", error);
    return {
      error: error.message || "Failed to send auction bid notifications",
    };
  }
};
