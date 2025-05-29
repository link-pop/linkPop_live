"use client";
import { useState, useEffect, useRef } from "react";
import PercentageBar from "../PercentageBar/PercentageBar";
import { useTranslation } from "@/components/Context/TranslationContext";

export default function TagProgressBar({ value = 0, max = 5, className = "" }) {
  const [displayedPercent, setDisplayedPercent] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);
  const percentage = Math.round((value / max) * 100);
  const barRef = useRef();
  const { t } = useTranslation();

  // If value equals max, don't render the component
  if (value >= max) {
    return null;
  }

  useEffect(() => {
    // Animate fill after mount
    const timeout = setTimeout(() => {
      setDisplayedPercent(percentage);
    }, 100); // slight delay for effect
    return () => clearTimeout(timeout);
  }, [percentage]);

  return (
    <div
      className={`relative w-full ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      ref={barRef}
      style={{ cursor: "pointer" }}
    >
      <PercentageBar
        percentage={displayedPercent}
        height={12}
        bgColor="bg-muted"
        barColor="bg_brand"
        animate={true}
      />
      <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-foreground">
        {value} / {max}
      </span>
      {showTooltip && (
        <div
          className="absolute left-1/2 -translate-x-1/2 -top-8 bg-background text-foreground text-xs px-3 py-1 rounded shadow z-10 whitespace-nowrap border border-accent"
          style={{ pointerEvents: "none" }}
        >
          {t("preferencesProgress")}
        </div>
      )}
    </div>
  );
}
