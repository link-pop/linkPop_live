"use client";

import { useState } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";
import { Package, Calendar, Truck, CheckCircle, X } from "lucide-react";

/**
 * OrderStatusFilter - A reusable component for filtering orders by status
 * @param {Array} orders - Array of orders to filter
 * @param {string} selectedStatus - Currently selected status filter
 * @param {function} onStatusChange - Callback when status filter changes
 * @param {string} className - Additional CSS classes
 */
export default function OrderStatusFilter({
  orders = [],
  selectedStatus = "all",
  onStatusChange,
  className = "",
}) {
  const { t } = useTranslation();

  // Count orders by status
  const getOrderCountByStatus = (status) => {
    if (status === "all") return orders.length;
    return orders.filter((order) => order.orderStatus === status).length;
  };

  // Define status options with icons and colors
  const statusOptions = [
    {
      key: "all",
      label: t("allOrders") || "All Orders",
      icon: Package,
      color: "text-foreground",
      bgColor: "bg-muted/30",
      borderColor: "border-border",
    },
    {
      key: "processing",
      label: t("shippingRequired") || "Shipping Required",
      icon: Calendar,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950/30",
      borderColor: "border-red-200 dark:border-red-800",
    },
    {
      key: "shipped",
      label: t("shipped") || "Shipped",
      icon: Truck,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
      borderColor: "border-purple-200 dark:border-purple-800",
    },
    {
      key: "delivered",
      label: t("delivered") || "Delivered",
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
      borderColor: "border-emerald-200 dark:border-emerald-800",
    },
    {
      key: "cancelled",
      label: t("cancelled") || "Cancelled",
      icon: X,
      color: "text-rose-600",
      bgColor: "bg-rose-50 dark:bg-rose-950/30",
      borderColor: "border-rose-200 dark:border-rose-800",
    },
  ];

  const handleStatusClick = (status) => {
    const newStatus = selectedStatus === status ? "all" : status;
    onStatusChange?.(newStatus);
  };

  return (
    <div className={`f g10 flex-wrap ${className}`}>
      {statusOptions.map((option) => {
        const count = getOrderCountByStatus(option.key);
        const isSelected = selectedStatus === option.key;
        const Icon = option.icon;

        // Don't show status options with 0 orders (except "all")
        if (count === 0 && option.key !== "all") return null;

        return (
          <button
            key={option.key}
            onClick={() => handleStatusClick(option.key)}
            className={`f aic g8 px12 py8 rounded-lg border transition-all duration-200 hover:shadow-sm ${
              isSelected
                ? `${option.bgColor} ${option.borderColor} ${option.color} shadow-sm`
                : "bg-background border-border text-muted-foreground hover:bg-muted/50"
            }`}
            title={`${option.label} (${count})`}
          >
            <Icon size={16} className={isSelected ? option.color : ""} />
            <span className="text-sm font-medium">{option.label}</span>
            <span
              className={`px6 py2 rounded-full text-xs font-bold ${
                isSelected
                  ? "bg-background/80 text-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
