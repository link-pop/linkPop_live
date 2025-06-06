"use client";

import { useState } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";
import { useContext } from "@/components/Context/Context";
import { formatPrice } from "@/lib/utils/formatPrice";
import {
  createShippingLabel,
  createLabelBrokerQRCode,
} from "@/lib/actions/shippoActions";
import { useQueryClient } from "@tanstack/react-query";
import ShippingConfirmationDialog from "./ShippingConfirmationDialog";
import {
  Package,
  Calendar,
  CreditCard,
  Truck,
  CheckCircle,
  Download,
  ExternalLink,
  QrCode,
} from "lucide-react";

export default function OrderCard({ order }) {
  const { t } = useTranslation();
  const { toastSet } = useContext();
  const queryClient = useQueryClient();
  const [isCreatingLabel, setIsCreatingLabel] = useState(false);
  const [isCreatingQRCode, setIsCreatingQRCode] = useState(false);

  // Define actual download functions first
  const actualDownloadLabel = () => {
    if (order.shippingLabelUrl) {
      window.open(order.shippingLabelUrl, "_blank");
    }
  };

  const actualDownloadLabelBrokerQRCode = () => {
    if (order.labelBrokerQRCodeUrl) {
      window.open(order.labelBrokerQRCodeUrl, "_blank");
    }
  };

  // Shipping confirmation dialogs
  const shippingConfirmation = ShippingConfirmationDialog({
    order,
    onConfirm: actualDownloadLabel,
    actionType: "download",
  });

  const shippingConfirmationQR = ShippingConfirmationDialog({
    order,
    onConfirm: actualDownloadLabelBrokerQRCode,
    actionType: "download",
  });

  // Debug: Log order payment status
  console.log(
    `Order ${order.orderNumber} payment status:`,
    order.paymentStatus
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "processing":
        return "text-blue-600 bg-blue-100";
      case "shipped":
        return "text-purple-600 bg-purple-100";
      case "delivered":
        return "text-green-600 bg-green-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "failed":
        return "text-red-600 bg-red-100";
      case "refunded":
        return "text-orange-600 bg-orange-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Calendar size={16} />;
      case "processing":
        return <Package size={16} />;
      case "shipped":
        return <Truck size={16} />;
      case "delivered":
        return <CheckCircle size={16} />;
      default:
        return <Package size={16} />;
    }
  };

  const handleCreateLabel = async () => {
    if (isCreatingLabel) return;

    setIsCreatingLabel(true);

    try {
      console.log(`Creating label for order ${order._id}`);

      const result = await createShippingLabel({
        orderId: order._id,
      });

      console.log("Label creation result:", result);

      if (result.error) {
        console.error("Label creation error:", result.error);
        toastSet({
          isOpen: true,
          title: t("error"),
          text: result.error,
        });
        return;
      }

      if (result.success && result.label) {
        toastSet({
          isOpen: true,
          title: t("shippingLabelCreated"),
          text: t("shippingLabelCreatedMessage"),
        });

        // Open label in new window
        if (result.label.url) {
          console.log("Opening label URL:", result.label.url);
          window.open(result.label.url, "_blank");
        }

        // Refresh the orders data
        queryClient.invalidateQueries(["userOrders"]);

        // Refresh the page after a short delay to show updated order status
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      console.error("Error creating shipping label:", error);
      toastSet({
        isOpen: true,
        title: t("error"),
        text: error.message || "Failed to create shipping label",
      });
    } finally {
      setIsCreatingLabel(false);
    }
  };

  const handleDownloadLabel = () => {
    console.log("Attempting to download label:", order.shippingLabelUrl);

    if (!order.shippingLabelUrl) {
      console.error("No shipping label URL found in order:", order);
      toastSet({
        isOpen: true,
        title: t("error"),
        text: "No shipping label URL found",
      });
      return;
    }

    // If order is already shipped, download directly
    if (order.orderStatus === "shipped") {
      window.open(order.shippingLabelUrl, "_blank");
      return;
    }

    // Show confirmation dialog for non-shipped orders
    shippingConfirmation.showConfirmationDialog();
  };

  const handleCreateLabelBrokerQRCode = async () => {
    if (isCreatingQRCode) return;

    setIsCreatingQRCode(true);

    try {
      console.log(`Creating Label Broker QR Code for order ${order._id}`);

      const result = await createLabelBrokerQRCode({
        orderId: order._id,
      });

      console.log("Label Broker QR Code creation result:", result);

      if (result.error) {
        console.error("Label Broker QR Code creation error:", result.error);
        toastSet({
          isOpen: true,
          title: t("error"),
          text: result.error,
          duration: 8000, // Show longer for detailed error messages
        });
        return;
      }

      if (result.success && result.qrCode) {
        toastSet({
          isOpen: true,
          title: t("labelBrokerQRCreated"),
          text: t("labelBrokerQRCreatedMessage"),
        });

        // Open QR code in new window
        if (result.qrCode.url) {
          console.log("Opening Label Broker QR Code URL:", result.qrCode.url);
          window.open(result.qrCode.url, "_blank");
        }

        // Refresh the orders data
        queryClient.invalidateQueries(["userOrders"]);

        // Refresh the page after a short delay to show updated order status
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      console.error("Error creating Label Broker QR Code:", error);
      toastSet({
        isOpen: true,
        title: t("error"),
        text: error.message || "Failed to create Label Broker QR Code",
      });
    } finally {
      setIsCreatingQRCode(false);
    }
  };

  const handleDownloadLabelBrokerQRCode = () => {
    console.log(
      "Attempting to download Label Broker QR Code:",
      order.labelBrokerQRCodeUrl
    );

    if (!order.labelBrokerQRCodeUrl) {
      console.error("No Label Broker QR Code URL found in order:", order);
      toastSet({
        isOpen: true,
        title: t("error"),
        text: "No Label Broker QR Code URL found",
      });
      return;
    }

    // If order is already shipped, download directly
    if (order.orderStatus === "shipped") {
      window.open(order.labelBrokerQRCodeUrl, "_blank");
      return;
    }

    // Show confirmation dialog for non-shipped orders
    shippingConfirmationQR.showConfirmationDialog();
  };

  return (
    <div className="border rounded-lg bg-background p20">
      {/* Order Header */}
      <div className="f jcsb aic mb15 pb15 border-b">
        <div>
          <h3 className="text-lg font-semibold">{order.orderNumber}</h3>
          <p className="text-sm text-muted-foreground">
            {new Date(order.createdAt).toLocaleDateString()} •{" "}
            {order.items?.length || 0} {t("items")}
          </p>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold">{formatPrice(order.total)}</div>
          <div className="f aic g5 mt5">
            <span
              className={`px8 py4 rounded-full text-xs font-medium ${getPaymentStatusColor(
                order.paymentStatus
              )}`}
            >
              <CreditCard size={12} className="inline mr5" />
              {order.paymentStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Order Status */}
      <div className="f aic g10 mb15">
        <span
          className={`f aic g5 px10 py5 rounded-full text-sm font-medium ${getStatusColor(
            order.orderStatus
          )}`}
        >
          {getStatusIcon(order.orderStatus)}
          {order.orderStatus}
        </span>
        {order.trackingNumber && (
          <span className="text-sm text-muted-foreground">
            {t("tracking")}: {order.trackingNumber}
          </span>
        )}
      </div>

      {/* Order Items */}
      <div className="fc g10">
        {order.items?.map((item, index) => (
          <div key={index} className="f aic g15 p10 bg-muted/30 rounded-lg">
            <div className="w50 h50 bg-muted rounded-lg overflow-hidden flex-shrink-0">
              {item.storeItemId?.files?.[0]?.fileUrl ? (
                <img
                  src={item.storeItemId.files[0].fileUrl}
                  alt={item.title || "Store item"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full fcc">
                  <Package className="w20 h20 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-medium">
                {item.title || item.storeItemId?.title || t("storeItem")}
              </h4>
              {(item.category || item.storeItemId?.category) && (
                <p className="text-sm text-muted-foreground uppercase tracking-wide">
                  {item.category || item.storeItemId?.category}
                </p>
              )}
              <div className="f aic g10 mt5">
                <span className="text-sm text-muted-foreground">
                  {t("quantity")}: {item.quantity}
                </span>
                <span className="text-sm font-medium">
                  {formatPrice(item.priceAtTime)} {t("each")}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium">
                {formatPrice(item.priceAtTime * item.quantity)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Shipping Address */}
      {process.env.NEXT_PUBLIC_DEV_MODE && order.shippingAddress && (
        <div className="mt15 pt15 border-t">
          <h4 className="font-medium mb5">Dev mode: {t("shippingAddress")}:</h4>
          <div className="text-sm text-muted-foreground">
            <div>{order.shippingAddress.name}</div>
            <div>{order.shippingAddress.line1}</div>
            {order.shippingAddress.line2 && (
              <div>{order.shippingAddress.line2}</div>
            )}
            <div>
              {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              {order.shippingAddress.postal_code}
            </div>
            <div>{order.shippingAddress.country}</div>
          </div>
        </div>
      )}

      {/* Order Dates */}
      <div className="mt15 pt15 border-t">
        <div className="f g20 text-sm text-muted-foreground">
          <div>
            <span className="font-medium">{t("ordered")}:</span>{" "}
            {new Date(order.createdAt).toLocaleDateString()}
          </div>
          {order.shippedAt && (
            <div>
              <span className="font-medium">{t("shipped")}:</span>{" "}
              {new Date(order.shippedAt).toLocaleDateString()}
            </div>
          )}
          {order.deliveredAt && (
            <div>
              <span className="font-medium">{t("delivered")}:</span>{" "}
              {new Date(order.deliveredAt).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>

      {/* Shipping Actions */}
      <div className="mt15 pt15 border-t">
        <div className="f g10 aic">
          {/* Show download button if label already exists */}
          {order.shippingLabelUrl && (
            <button
              onClick={handleDownloadLabel}
              className="px15 py8 bg-green-600 hover:bg-green-700 text-white rounded-lg f aic g8 text-sm font-medium transition-colors"
            >
              <ExternalLink size={16} />
              {t("downloadLabel")}
            </button>
          )}

          {/* Show download button for Label Broker QR Code if it exists */}
          {order.labelBrokerQRCodeUrl && (
            <button
              onClick={handleDownloadLabelBrokerQRCode}
              className="px15 py8 bg-blue-600 hover:bg-blue-700 text-white rounded-lg f aic g8 text-sm font-medium transition-colors"
              title={t("labelBrokerQRDescription")}
            >
              <QrCode size={16} />
              {t("downloadLabelBrokerQR")}
            </button>
          )}

          {/* Show create Label Broker QR Code button if label exists but QR code doesn't */}
          {order.shippingLabelUrl &&
            !order.labelBrokerQRCodeUrl &&
            order.shippoTransactionId && (
              <button
                onClick={handleCreateLabelBrokerQRCode}
                disabled={isCreatingQRCode}
                className={`px15 py8 bg-blue-600 hover:bg-blue-700 text-white rounded-lg f aic g8 text-sm font-medium transition-colors ${
                  isCreatingQRCode ? "opacity-50 cursor-not-allowed" : ""
                }`}
                title={t("labelBrokerQRDescription")}
              >
                <QrCode size={16} />
                {isCreatingQRCode
                  ? t("creatingLabelBrokerQR")
                  : t("createLabelBrokerQR")}
              </button>
            )}

          {/* Show create label button if no label exists yet but payment is made */}
          {!order.shippingLabelUrl &&
            order.paymentStatus === "paid" &&
            order.shippoShipmentId && (
              <button
                onClick={handleCreateLabel}
                disabled={isCreatingLabel}
                className={`px15 py8 bg-accent hover:bg-accent/80 text-accent-foreground rounded-lg f aic g8 text-sm font-medium transition-colors ${
                  isCreatingLabel ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Download size={16} />
                {isCreatingLabel ? t("creatingLabel") : t("createLabel")}
              </button>
            )}

          {/* Show shipment status messages */}
          {order.shippoShipmentId &&
            !order.shippingLabelUrl &&
            order.paymentStatus === "paid" &&
            !isCreatingLabel && (
              <span className="text-sm text-muted-foreground">
                {t("shipmentCreated")} - {t("readyForLabel")}
              </span>
            )}

          {!order.shippoShipmentId && order.paymentStatus === "paid" && (
            <span className="text-sm text-muted-foreground">
              {t("preparingShipment")}
            </span>
          )}

          {order.paymentStatus === "pending" && (
            <span className="text-sm text-yellow-600">
              {t("paymentPending")}
            </span>
          )}

          {order.paymentStatus !== "paid" &&
            order.paymentStatus !== "pending" && (
              <span className="text-sm text-muted-foreground">
                {t("paymentRequired")}
              </span>
            )}
        </div>

        {/* Label Broker QR Code Info */}
        {(order.labelBrokerQRCodeUrl ||
          (order.shippingLabelUrl && order.shippoTransactionId)) && (
          <div className="mt10 p10 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="f aic g8 mb5">
              <QrCode size={16} className="text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                {t("labelBrokerQRCode")}
              </span>
            </div>
            <p className="text-xs text-blue-700">
              {t("labelBrokerQRDescription")} • {t("noPrinterNeeded")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
