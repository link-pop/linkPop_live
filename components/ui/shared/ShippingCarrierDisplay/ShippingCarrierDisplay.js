"use client";

import { Truck, Package } from "lucide-react";
import { useTranslation } from "@/components/Context/TranslationContext";
import { getCarrierDisplayInfo } from "@/lib/utils/shippo/carrierUtils";

export default function ShippingCarrierDisplay({
  carrierAccount,
  trackingNumber,
  className = "",
  showIcon = true,
  variant = "default", // "default", "compact", "badge"
}) {
  const { t } = useTranslation();

  // Get carrier display information (always USPS as per requirements)
  const carrierInfo = getCarrierDisplayInfo(carrierAccount);

  const renderIcon = () => {
    if (!showIcon) return null;

    return carrierInfo.icon === "truck" ? (
      <Truck size={16} className={carrierInfo.color} />
    ) : (
      <Package size={16} className={carrierInfo.color} />
    );
  };

  const renderContent = () => {
    switch (variant) {
      case "compact":
        return (
          <div className={`f aic g5 ${className}`}>
            {renderIcon()}
            <span className={`text-sm font-medium ${carrierInfo.color}`}>
              {carrierInfo.displayName}
            </span>
          </div>
        );

      case "badge":
        return (
          <span
            className={`f aic g5 px8 py4 rounded-full text-xs font-medium ${carrierInfo.color} ${carrierInfo.bgColor} ${className}`}
          >
            {renderIcon()}
            {carrierInfo.displayName}
          </span>
        );

      default:
        return (
          <div className={`f aic g8 ${className}`}>
            {renderIcon()}
            <div>
              <div className={`font-medium ${carrierInfo.color}`}>
                {t("shippedViaUSPS") || "Shipped via USPS"}
              </div>
              {trackingNumber && (
                <div className="text-sm text-muted-foreground">
                  {t("tracking")}: {trackingNumber}
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return process.env.NEXT_PUBLIC_DEV_MODE ? renderContent() : null;
}
