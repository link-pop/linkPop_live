import { useTranslation } from "@/components/Context/TranslationContext";
import { formatPrice } from "@/lib/utils/formatPrice";
import Button2 from "@/components/ui/shared/Button/Button2";

export default function CartSummary({
  subtotal,
  shippingCost,
  total,
  isCheckingOut,
  onCheckout,
  isCheckoutDisabled,
  isMobile = false,
  shippingAddress = null,
}) {
  const { t } = useTranslation();

  // Check if shipping information is filled (address provided and shipping cost calculated)
  const isShippingInfoFilled = () => {
    return shippingAddress && shippingCost > 0;
  };

  return (
    <div className="bg-accent/10 border border-accent/30 rounded-xl p25 shadow-md">
      <div className="fc g15 mb20">
        <div className="f jcsb aic">
          <span className="font-medium text-foreground">{t("subtotal")}:</span>
          <span className="font-bold text-foreground">
            {formatPrice(subtotal)}
          </span>
        </div>

        {shippingCost > 0 && (
          <div className="f jcsb aic">
            <span className="font-medium text-foreground">
              {t("shipping")}:
            </span>
            <span className="font-bold text-foreground">
              {formatPrice(shippingCost)}
            </span>
          </div>
        )}

        <div className="border-t pt15">
          <div className="f jcsb aic">
            <span className="text-xl font-bold text-foreground">
              {t("total")}:
            </span>
            <span className="text-2xl font-bold text-accent-foreground">
              {formatPrice(total)}
            </span>
          </div>
        </div>
      </div>

      <Button2
        text={isCheckingOut ? t("processing") : t("proceedToCheckout")}
        onClick={onCheckout}
        disabled={isCheckoutDisabled}
        variant={isShippingInfoFilled() ? "primary" : "outline"}
        className="w-full"
      />
    </div>
  );
}
