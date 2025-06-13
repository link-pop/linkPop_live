"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";
import { useContext } from "@/components/Context/Context";
import {
  cancelStoreItemOrder,
  canCancelOrder,
} from "@/lib/actions/cancelStoreItemOrder";
import { useQueryClient } from "@tanstack/react-query";
import { X, RefreshCw } from "lucide-react";
import AlertDialog from "@/components/ui/shared/AlertDialog/AlertDialog";

export default function CancelOrderButton({
  order,
  mongoUser,
  className = "",
  variant = "default", // "default", "compact"
  onCancelSuccess,
}) {
  const { t } = useTranslation();
  const { toastSet, dialogSet } = useContext();
  const queryClient = useQueryClient();
  const [isCancelling, setIsCancelling] = useState(false);
  const [canCancel, setCanCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [daysRemaining, setDaysRemaining] = useState(0);

  // Check if order can be cancelled
  useEffect(() => {
    const checkCancellationEligibility = async () => {
      if (!order?._id || !mongoUser?._id) return;

      try {
        const result = await canCancelOrder({ orderId: order._id });
        setCanCancel(result.canCancel);
        setCancelReason(result.reason || "");
        setDaysRemaining(result.daysRemaining || 0);
      } catch (error) {
        console.error("Error checking cancellation eligibility:", error);
        setCanCancel(false);
        setCancelReason("Error checking eligibility");
      }
    };

    checkCancellationEligibility();
  }, [order?._id, mongoUser?._id]);

  const handleCancelOrder = async () => {
    if (isCancelling || (!canCancel && !mongoUser?.isDev)) return;

    setIsCancelling(true);

    try {
      const result = await cancelStoreItemOrder({ orderId: order._id });

      if (result.error) {
        toastSet({
          isOpen: true,
          title: t("error"),
          text: result.error,
        });
        return;
      }

      if (result.success) {
        toastSet({
          isOpen: true,
          title: t("orderCancelled"),
          text: result.message || t("orderCancelledSuccessfully"),
        });

        // Refresh orders data
        queryClient.invalidateQueries(["userOrders"]);
        queryClient.invalidateQueries(["storeOwnerOrders"]);

        // Call success callback if provided
        if (onCancelSuccess) {
          onCancelSuccess(result);
        }
      }
    } catch (error) {
      console.error("❌ Error cancelling order:", error);
      toastSet({
        isOpen: true,
        title: t("error"),
        text: error.message || "Failed to cancel order",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  // Don't render if user is not authenticated
  if (!mongoUser?._id) {
    return null;
  }

  // Don't render if order is already cancelled or refunded
  if (order.orderStatus === "cancelled" || order.paymentStatus === "refunded") {
    return null;
  }

  // Don't render if order is not paid
  if (order.paymentStatus !== "paid") {
    return null;
  }

  // Don't render if order has been shipped or delivered
  if (order.orderStatus === "shipped" || order.orderStatus === "delivered") {
    return null;
  }

  const getButtonClasses = () => {
    const baseClasses = "f aic g8 rounded-lg font-medium transition-colors";
    const variantClasses = {
      default: "px15 py8 text-sm",
      compact: "px10 py6 text-xs",
    };

    // Always make the button red, but adjust opacity and cursor for disabled state
    const statusClasses = canCancel
      ? "bg-red-600 hover:bg-red-700 text-white cursor-pointer"
      : "bg-red-600/50 text-white cursor-not-allowed";

    const loadingClasses = isCancelling ? "opacity-50 cursor-not-allowed" : "";

    return `${baseClasses} ${variantClasses[variant]} ${statusClasses} ${loadingClasses} ${className}`;
  };

  const getButtonText = () => {
    if (isCancelling) {
      return t("cancelling");
    }
    if (!canCancel && daysRemaining > 0) {
      return `${t("cancelOrder")} (${daysRemaining}d)`;
    }
    if (!canCancel) {
      return t("cancelOrder");
    }
    return t("cancelOrder");
  };

  const getTooltipText = () => {
    if (!canCancel && daysRemaining > 0) {
      return `${t("orderCanBeCancelledAfter")} 1 ${t(
        "week"
      )}. ${daysRemaining} ${t("daysRemaining")}.`;
    }
    if (!canCancel) {
      return cancelReason;
    }
    return t("cancelOrderAndProcessRefund");
  };

  // If button is disabled, show it as a regular button with tooltip
  if (!canCancel && !mongoUser?.isDev) {
    return (
      <button
        className={getButtonClasses()}
        disabled={true}
        title={getTooltipText()}
      >
        <X size={16} />
        {getButtonText()}
      </button>
    );
  }

  const handleCancelDialog = () => {
    setIsCancelling(true);
    dialogSet({
      isOpen: true,
      title: t("cancelOrder"),
      text: t("cancelOrderConfirmationMessage"),
      action: handleCancelOrder,
      onCancel: () => setIsCancelling(false),
      actionText: t("cancelOrder"),
      cancelText: t("keepOrder"),
    });
  };

  // If button is enabled, show it with AlertDialog
  return (
    <button
      className={getButtonClasses()}
      disabled={isCancelling}
      title={getTooltipText()}
      onClick={handleCancelDialog}
    >
      {isCancelling ? (
        <RefreshCw size={16} className="animate-spin" />
      ) : (
        <X size={16} />
      )}
      {getButtonText()}
    </button>
  );
}
