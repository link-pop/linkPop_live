"use client";

import { useTranslation } from "@/components/Context/TranslationContext";
import { formatPrice } from "@/lib/utils/formatPrice";

export default function OrderCostBreakdown({
  order,
  showSubtotal = true,
  showShipping = true,
  showTax = true,
  showTotal = true,
  className = "",
  subtotalLabel,
  shippingLabel,
  taxLabel,
  totalLabel,
}) {
  const { t } = useTranslation();

  // Allow custom labels or use default translations
  const labels = {
    subtotal: subtotalLabel || t("subtotal"),
    shipping: shippingLabel || t("shipping"),
    tax: taxLabel || t("tax"),
    total: totalLabel || t("total"),
  };

  if (!order) return null;

  return (
    <div className={`fc g8 ${className}`}>
      {showSubtotal && order.subtotal > 0 && (
        <div className="f jcsb aic">
          <span className="text-sm text-muted-foreground">
            {labels.subtotal}:
          </span>
          <span className="text-sm font-medium text-foreground">
            {formatPrice(order.subtotal)}
          </span>
        </div>
      )}

      {showShipping && order.shipping > 0 && (
        <div className="f jcsb aic">
          <span className="text-sm text-muted-foreground">
            {labels.shipping}:
          </span>
          <span className="text-sm font-medium text-foreground">
            {formatPrice(order.shipping)}
          </span>
        </div>
      )}

      {showTax && order.tax > 0 && (
        <div className="f jcsb aic">
          <span className="text-sm text-muted-foreground">{labels.tax}:</span>
          <span className="text-sm font-medium text-foreground">
            {formatPrice(order.tax)}
          </span>
        </div>
      )}

      {showTotal && (
        <div className="border-t pt8 mt8">
          <div className="f jcsb aic">
            <span className="font-semibold text-foreground">
              {labels.total}:
            </span>
            <span className="font-bold text-foreground">
              {formatPrice(order.total)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
