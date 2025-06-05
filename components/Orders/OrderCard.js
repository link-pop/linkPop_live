"use client";

import { useTranslation } from "@/components/Context/TranslationContext";
import { formatPrice } from "@/lib/utils/formatPrice";
import {
  Package,
  Calendar,
  CreditCard,
  Truck,
  CheckCircle,
} from "lucide-react";

export default function OrderCard({ order }) {
  const { t } = useTranslation();

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
      {order.shippingAddress && (
        <div className="mt15 pt15 border-t">
          <h4 className="font-medium mb5">{t("shippingAddress")}:</h4>
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
    </div>
  );
}
