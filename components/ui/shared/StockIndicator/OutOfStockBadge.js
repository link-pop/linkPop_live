"use client";

import { useTranslation } from "@/components/Context/TranslationContext";

export default function OutOfStockBadge({
  className = "",
  variant = "default", // "default", "compact"
}) {
  const { t } = useTranslation();

  const variantClasses = {
    default: "px8 py4 text-sm font-medium",
    compact: "px6 py2 text-xs font-medium",
  };

  return (
    <div
      className={`
        bg-red-500 text-white rounded-lg 
        ${variantClasses[variant]} 
        ${className}
      `}
    >
      {t("outOfStock")}
    </div>
  );
}
