"use client";

import { useTranslation } from "@/components/Context/TranslationContext";

export default function PriceTag({
  price = 0,
  className = "absolute top-2 left-2 z-10",
}) {
  const { t } = useTranslation();
  const isFree = price === 0;

  return (
    <div className={className}>
      <span className="text-xs bg-black/30 backdrop-blur-sm text-white px-2 py-0.5 rounded font-medium">
        {isFree ? t("free") || "Free" : `$${price}`}
      </span>
    </div>
  );
}
