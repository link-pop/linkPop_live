"use client";

import { useState } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";
import { useContext } from "@/components/Context/Context";
import { updateOrderStatus } from "@/lib/actions/updateOrderStatus";
import { useQueryClient } from "@tanstack/react-query";

export default function ShippingConfirmationDialog({
  order,
  onConfirm,
  actionType = "download", // "download" or "create"
}) {
  const { t } = useTranslation();
  const { dialogSet, toastSet } = useContext();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  const showConfirmationDialog = () => {
    dialogSet({
      isOpen: true,
      title: t("confirmShipping"),
      text: t("confirmShippingMessage"),
      confirmBtnText: t("confirmAndMarkShipped"),
      showCancelBtn: true,
      cancelBtnText: t("cancel"),
      isDanger: false,
      action: async () => {
        await handleConfirmShipping();
      },
    });
  };

  const handleConfirmShipping = async () => {
    if (isUpdating) return;

    setIsUpdating(true);

    try {
      // Update order status to "shipped"
      const result = await updateOrderStatus({
        orderId: order._id,
        orderStatus: "shipped",
      });

      if (result?.error) {
        toastSet({
          isOpen: true,
          title: t("error"),
          text: result.error,
        });
        return;
      }

      // Show success message
      toastSet({
        isOpen: true,
        title: t("orderMarkedAsShipped"),
        text: t("orderMarkedAsShippedMessage"),
      });

      // Refresh orders data
      queryClient.invalidateQueries(["userOrders"]);

      // Call the original action (download or create)
      if (onConfirm) {
        onConfirm();
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toastSet({
        isOpen: true,
        title: t("error"),
        text: error.message || "Failed to update order status",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    showConfirmationDialog,
    isUpdating,
  };
}
