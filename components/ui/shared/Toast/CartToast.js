"use client";

import { useTranslation } from "@/components/Context/TranslationContext";
import { useContext } from "@/components/Context/Context";
import OrderItemImageDisplay from "@/components/ui/shared/SimpleImageDisplay/OrderItemImageDisplay";

export default function CartToast() {
  const { t } = useTranslation();
  const { toastSet } = useContext();

  const showCartToast = ({
    type, // "added", "removed", "updated", "error"
    storeItem,
    quantity = 1,
    errorMessage = null,
  }) => {
    const getToastConfig = () => {
      switch (type) {
        case "added":
          return {
            title: t("addedToCart"),
            text: storeItem?.title || t("storeItem"),
            duration: 3000,
          };
        case "removed":
          return {
            title: t("removedFromCart"),
            text: storeItem?.title || t("storeItem"),
            duration: 3000,
          };
        case "updated":
          return {
            title: t("cartUpdated"),
            text: `${storeItem?.title || t("storeItem")} - ${t(
              "quantity"
            )}: ${quantity}`,
            duration: 3000,
          };
        case "error":
          return {
            title: t("errorAddingToCart"),
            text: errorMessage || "An error occurred",
            duration: 5000,
          };
        default:
          return {
            title: t("cartUpdated"),
            text: storeItem?.title || t("storeItem"),
            duration: 3000,
          };
      }
    };

    const config = getToastConfig();

    // Create custom content with image and title for non-error toasts
    if (type !== "error" && storeItem) {
      const customContent = (
        <div className="f aic g10">
          <OrderItemImageDisplay
            item={storeItem}
            size={40}
            className="flex-shrink-0"
            alt={storeItem.title || "Store item"}
          />
          <div className="flex-1">
            <div className="font-medium text-foreground">
              {storeItem.title || t("storeItem")}
            </div>
            {type === "updated" && (
              <div className="text-sm text-muted-foreground">
                {t("quantity")}: {quantity}
              </div>
            )}
          </div>
        </div>
      );

      toastSet({
        isOpen: true,
        title: config.title,
        customContent,
        duration: config.duration,
      });
    } else {
      // Standard toast for errors or when no store item
      toastSet({
        isOpen: true,
        title: config.title,
        text: config.text,
        duration: config.duration,
      });
    }
  };

  return { showCartToast };
}
