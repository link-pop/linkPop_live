"use client";

import { BadgeDollarSign, BadgeMinus } from "lucide-react";
import { useTranslation } from "@/components/Context/TranslationContext";

/**
 * PriceFilterToggle - A reusable component for filtering content by price
 * @param {boolean} showPaidOnly - Current filter state (true = paid only, false = free only)
 * @param {function} onToggle - Callback when filter is toggled
 * @param {string} className - Additional CSS classes
 */
export default function PriceFilterToggle({
  showPaidOnly = true,
  onToggle,
  className = "",
}) {
  const { t } = useTranslation();

  const handleToggle = () => {
    onToggle?.(!showPaidOnly);
  };

  // Use BadgeDollarSign for paid, BadgeMinus for free
  const Icon = showPaidOnly ? BadgeDollarSign : BadgeMinus;

  return (
    <div
      className={`cursor-pointer select-none text-foreground/40 hover:text-foreground transition-colors ${className}`}
      onClick={handleToggle}
      title={
        showPaidOnly
          ? t("showFreeCreators") || "Show free creators"
          : t("showPaidCreators") || "Show paid creators"
      }
    >
      <Icon size={18} className="cp" />
    </div>
  );
}
