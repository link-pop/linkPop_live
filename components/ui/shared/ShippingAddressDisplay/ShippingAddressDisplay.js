"use client";

import { useTranslation } from "@/components/Context/TranslationContext";
import { MapPin } from "lucide-react";

export default function ShippingAddressDisplay({
  shippingAddress,
  className = "",
  showIcon = true,
  variant = "default", // "default", "compact", "inline"
}) {
  const { t } = useTranslation();

  if (!shippingAddress) {
    return null;
  }

  const formatAddress = () => {
    const addressParts = [
      shippingAddress.line1,
      shippingAddress.line2,
      shippingAddress.city,
      shippingAddress.state,
      shippingAddress.postal_code,
      shippingAddress.country,
    ].filter(Boolean);

    return {
      name: shippingAddress.name,
      fullAddress: addressParts.join(", "),
    };
  };

  const { name, fullAddress } = formatAddress();

  if (variant === "inline") {
    return (
      <span className={`text-sm text-muted-foreground ${className}`}>
        {name ? `${name}, ` : ""}
        {fullAddress}
      </span>
    );
  }

  if (variant === "compact") {
    return (
      <div className={`fc g5 ${className}`}>
        {showIcon && (
          <div className="f aic g5">
            <MapPin className="w16 h16 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              {t("shippingAddress")}:
            </span>
          </div>
        )}
        <div className="text-sm text-muted-foreground">
          {name && <div className="font-medium text-foreground">{name}</div>}
          <div>{fullAddress}</div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`fc g10 p15 bg-muted/30 rounded-lg ${className}`}>
      <div className="f aic g8">
        {showIcon && <MapPin className="w16 h16 text-accent" />}
        <h4 className="font-medium text-foreground">{t("shippingAddress")}</h4>
      </div>
      <div className="fc g5">
        {name && <div className="font-medium text-foreground">{name}</div>}
        <div className="text-sm text-muted-foreground">
          {shippingAddress.line1}
          {shippingAddress.line2 && (
            <>
              <br />
              {shippingAddress.line2}
            </>
          )}
          <br />
          {shippingAddress.city}, {shippingAddress.state}{" "}
          {shippingAddress.postal_code}
          <br />
          {shippingAddress.country}
        </div>
      </div>
    </div>
  );
}
