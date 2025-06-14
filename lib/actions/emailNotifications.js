"use server";

import mailer from "@/lib/utils/mailer/mailer";
import { getOne } from "./crud";

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
            ${
              order.trackingNumber
                ? `<p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>`
                : ""
            }
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

          ${
            order.trackingNumber
              ? `
          <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1e40af; margin-top: 0;">📍 Track Your Package:</h3>
            <p>You can track your package using the tracking number above at:</p>
            <a href="https://tools.usps.com/go/TrackConfirmAction?tLabels=${order.trackingNumber}" 
               style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Track on USPS
            </a>
          </div>
          `
              : ""
          }

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
            ${
              order.trackingNumber
                ? `<p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>`
                : ""
            }
          </div>

          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #374151; margin-top: 0;">Items Delivered:</h3>
            <pre style="font-family: Arial, sans-serif; white-space: pre-wrap; margin: 0;">${itemsList}</pre>
          </div>

          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1e40af; margin-top: 0;">🎉 Enjoy Your Purchase!</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Your order has been successfully delivered</li>
              <li>We hope you're satisfied with your purchase</li>
              <li>If you have any issues, please contact the store owner</li>
              <li>Thank you for shopping with us!</li>
            </ul>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_CLIENT_URL}/orders" 
               style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Order Details
            </a>
          </div>

          <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 30px;">
            Thank you for your business! 🎉
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
