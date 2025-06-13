"use client";

import { useTranslation } from "@/components/Context/TranslationContext";
import { useContext } from "@/components/Context/Context";
import { useRouter } from "next/navigation";
import OrderItemImageDisplay from "@/components/ui/shared/SimpleImageDisplay/OrderItemImageDisplay";
import { CART_ROUTE } from "@/lib/utils/constants";

export default function CartToast({ navigateToRoute = CART_ROUTE } = {}) {
  const { t } = useTranslation();
  const { toastSet } = useContext();
  const router = useRouter();

  const showCartToast = ({
    type, // "added", "removed", "updated", "error"
    storeItem,
    quantity = 1,
    errorMessage = null,
    onToastClick = null, // Custom click handler, if not provided will navigate to navigateToRoute
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

    // Handle toast click - either custom handler or navigate to route
    const handleToastClick = () => {
      if (onToastClick) {
        onToastClick();
      } else if (navigateToRoute) {
        router.push(navigateToRoute);
      }
    };

    // Create custom content with image and title for non-error toasts
    if (type !== "error" && storeItem) {
      const customContent = (
        <div
          className="f aic g10 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleToastClick}
        >
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
        ...(type !== "error" &&
          navigateToRoute && {
            onClick: handleToastClick,
          }),
      });
    }
  };

  return { showCartToast };
}
