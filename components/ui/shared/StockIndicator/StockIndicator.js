"use client";

import { useTranslation } from "@/components/Context/TranslationContext";
import { Package, AlertTriangle } from "lucide-react";

export default function StockIndicator({
  stock = 0,
  showIcon = true,
  showText = true,
  variant = "default", // "default", "compact", "badge"
  className = "",
}) {
  const { t } = useTranslation();

  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;

  const getStockColor = () => {
    if (isOutOfStock) return "text-destructive";
    if (isLowStock) return "text-amber-600";
    return "text-emerald-600";
  };

  const getStockBgColor = () => {
    if (isOutOfStock) return "bg-destructive/10 border-destructive/20";
    if (isLowStock) return "bg-amber-50 border-amber-200";
    return "bg-emerald-50 border-emerald-200";
  };

  const getStockText = () => {
    if (isOutOfStock) return t("outOfStock");
    if (stock === 1) return `1 ${t("stockRemaining")}`;
    return `${stock} ${t("stockRemaining")}`;
  };

  const renderIcon = () => {
    if (!showIcon) return null;

    const iconSize = variant === "compact" ? 14 : 16;

    if (isOutOfStock) {
      return <AlertTriangle size={iconSize} className="text-destructive" />;
    }

    return <Package size={iconSize} className={getStockColor()} />;
  };

  const renderContent = () => {
    if (variant === "badge") {
      return (
        <div
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStockBgColor()} ${getStockColor()} ${className}`}
        >
          {renderIcon()}
          {showText && <span>{getStockText()}</span>}
        </div>
      );
    }

    if (variant === "compact") {
      return (
        <div
          className={`flex items-center gap-1 text-sm ${getStockColor()} ${className}`}
        >
          {renderIcon()}
          {showText && <span>{getStockText()}</span>}
        </div>
      );
    }

    // Default variant
    return (
      <div
        className={`flex items-center gap-2 ${getStockColor()} ${className}`}
      >
        {renderIcon()}
        {showText && (
          <span className="text-sm font-medium">{getStockText()}</span>
        )}
      </div>
    );
  };

  return renderContent();
}
