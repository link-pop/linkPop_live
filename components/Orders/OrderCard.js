"use client";

import { useState } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";
import { useContext } from "@/components/Context/Context";
import { formatPrice } from "@/lib/utils/formatPrice";
import {
  createShippingLabel,
  createLabelBrokerQRCode,
  downloadShippingLabel,
  downloadLabelBrokerQRCode,
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
import OrderItemImageDisplay from "@/components/ui/shared/SimpleImageDisplay/OrderItemImageDisplay";
import USPSTrackingLink from "@/components/ui/shared/USPSTrackingLink/USPSTrackingLink";
import CreatedBy from "@/components/Post/Post/CreatedBy";

export default function OrderCard({ order, isStoreOwner = false }) {
  const { t } = useTranslation();
  const { toastSet } = useContext();
  const queryClient = useQueryClient();
  const [isCreatingLabel, setIsCreatingLabel] = useState(false);
  const [isCreatingQRCode, setIsCreatingQRCode] = useState(false);

  // Define actual download functions first
  const actualDownloadLabel = async () => {
    try {
      const result = await downloadShippingLabel({ orderId: order._id });

      if (result.error) {
        toastSet({
          isOpen: true,
          title: t("error"),
          text: result.error,
        });
        return;
      }

      if (result.success && result.label?.url) {
        window.open(result.label.url, "_blank");
      }
    } catch (error) {
      console.error("Error downloading shipping label:", error);
      toastSet({
        isOpen: true,
        title: t("error"),
        text: error.message || "Failed to download shipping label",
      });
    }
  };

  const actualDownloadLabelBrokerQRCode = async () => {
    try {
      const result = await downloadLabelBrokerQRCode({ orderId: order._id });

      if (result.error) {
        toastSet({
          isOpen: true,
          title: t("error"),
          text: result.error,
        });
        return;
      }

      if (result.success && result.qrCode?.url) {
        window.open(result.qrCode.url, "_blank");
      }
    } catch (error) {
      console.error("Error downloading Label Broker QR Code:", error);
      toastSet({
        isOpen: true,
        title: t("error"),
        text: error.message || "Failed to download Label Broker QR Code",
      });
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
        return "text-amber-600 bg-amber-50 border-amber-200";
      case "processing":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "shipped":
        return "text-purple-600 bg-purple-50 border-purple-200";
      case "delivered":
        return "text-emerald-600 bg-emerald-50 border-emerald-200";
      case "cancelled":
        return "text-rose-600 bg-rose-50 border-rose-200";
      default:
        return "text-muted-foreground bg-muted border-border";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "text-emerald-600 bg-emerald-50 border-emerald-200";
      case "pending":
        return "text-amber-600 bg-amber-50 border-amber-200";
      case "failed":
        return "text-rose-600 bg-rose-50 border-rose-200";
      case "refunded":
        return "text-orange-600 bg-orange-50 border-orange-200";
      default:
        return "text-muted-foreground bg-muted border-border";
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
      actualDownloadLabel();
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
      actualDownloadLabelBrokerQRCode();
      return;
    }

    // Show confirmation dialog for non-shipped orders
    shippingConfirmationQR.showConfirmationDialog();
  };

  return (
    <div className="border border-border rounded-lg bg-background p20">
      {/* Order Header */}
      <div className="f jcsb aic mb15 pb15 border-b border-border">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {order.orderNumber}
          </h3>
          <p className="text-sm text-muted-foreground">
            {new Date(order.createdAt).toLocaleDateString()} •{" "}
            {order.items?.length || 0} {t("items")}
          </p>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-foreground">
            {formatPrice(order.total)}
          </div>
          <div className="f aic g5 mt5">
            <span
              className={`px8 py4 rounded-full text-xs font-medium border ${getPaymentStatusColor(
                order.paymentStatus
              )}`}
            >
              <CreditCard size={12} className="inline mr5" />
              {order.paymentStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Store Owner Info - Only show for buyers */}
      {!isStoreOwner && order.storeOwner && (
        <div className="f aic g10 mb15 p10 bg-muted/30 rounded-lg">
          <div className="flex-1">
            <div className="mb4 text-sm text-muted-foreground mr5">
              {t("storeOwner")}:
            </div>
            <CreatedBy
              createdBy={order.storeOwner}
              showName={true}
              wrapClassName="inline-flex"
              className="text-sm"
              nameClassName="font-medium"
            />
          </div>
        </div>
      )}

      {/* Order Status */}
      <div className="f aic g10 mb15">
        <span
          className={`f aic g5 px10 py5 rounded-full text-sm font-medium border ${getStatusColor(
            order.orderStatus
          )}`}
        >
          {getStatusIcon(order.orderStatus)}
          {order.orderStatus}
        </span>
        {/* Show tracking ONLY if orderStatus is "shipped" */}
        {order.orderStatus === "shipped" && order.trackingNumber && (
          <span className="text-sm text-muted-foreground f aic g5">
            {t("tracking")}:{" "}
            <USPSTrackingLink
              trackingNumber={order.trackingNumber}
              className="font-mono text-sm"
            />
          </span>
        )}
      </div>

      {/* Order Items */}
      <div className="fc g10">
        {order.items?.map((item, index) => (
          <div key={index} className="f aic g15 p10 bg-muted/30 rounded-lg">
            <OrderItemImageDisplay
              item={item}
              size={50}
              className="flex-shrink-0"
              alt={item.title || "Store item"}
            />
            <div className="flex-1">
              <h4 className="font-medium text-foreground">
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
                <span className="text-sm font-medium text-foreground">
                  {formatPrice(item.priceAtTime)} {t("each")}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium text-foreground">
                {formatPrice(item.priceAtTime * item.quantity)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Date - Single ordered date */}
      <div className="mt15 pt15 border-t border-border">
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{t("ordered")}:</span>{" "}
          {new Date(order.createdAt).toLocaleDateString()}
        </div>
      </div>

      {/* Shipping Actions - Only show for store owners */}
      {isStoreOwner && (
        <div className="mt15 pt15 border-t border-border">
          <div className="f g10 aic">
            {/* Show download button if label already exists */}
            {order.shippingLabelUrl && (
              <button
                onClick={handleDownloadLabel}
                className="px15 py8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg f aic g8 text-sm font-medium transition-colors"
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
                  className={`px15 py8 bg-accent hover:bg-accent/80 text-foreground-foreground rounded-lg f aic g8 text-sm font-medium transition-colors ${
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
              <span className="text-sm text-amber-600">
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
            <div className="mt10 p10 bg-accent border border-border rounded-lg">
              <div className="f aic g8 mb5">
                <QrCode size={16} className="text-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {t("labelBrokerQRCode")}
                </span>
              </div>
              <p className="text-xs text-foreground">
                {t("labelBrokerQRDescription")} • {t("noPrinterNeeded")}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
