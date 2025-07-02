"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";

export default function PromotionCountdown({
  endsAt,
  promotion,
  promotionTextColor,
}) {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState({
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  // Utility function to ensure a valid hex color
  const ensureValidHexColor = (color) => {
    if (!color || color === "") return "#FF0000";
    const isValidHex = /^#([0-9A-F]{3}){1,2}$/i.test(color);
    return isValidHex ? color : "#FF0000";
  };

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const endTime = new Date(endsAt);
      const difference = endTime - now;
      if (difference <= 0) {
        return { hours: "00", minutes: "00", seconds: "00" };
      }
      const hours = String(Math.floor(difference / (1000 * 60 * 60))).padStart(
        2,
        "0"
      );
      const minutes = String(
        Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      ).padStart(2, "0");
      const seconds = String(
        Math.floor((difference % (1000 * 60)) / 1000)
      ).padStart(2, "0");
      return { hours, minutes, seconds };
    };
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (
        remaining.hours === "00" &&
        remaining.minutes === "00" &&
        remaining.seconds === "00"
      ) {
        clearInterval(timer);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [endsAt]);

  // If timer is over, don't render
  if (
    timeLeft.hours === "00" &&
    timeLeft.minutes === "00" &&
    timeLeft.seconds === "00"
  )
    return null;

  return (
    <div className="fc aic jcc g1 wfc">
      <div className="tac wf">
        <div
          className="fw700 fz22 landing-page-text2"
          style={{
            letterSpacing: 1,
            color: ensureValidHexColor(promotionTextColor),
          }}
        >
          {promotion} {t("endsIn")?.toUpperCase() || "ENDS IN"}
        </div>
      </div>
      <div className="f aic jcc g2 mt-2">
        {[timeLeft.hours, timeLeft.minutes, timeLeft.seconds].map(
          (unit, idx, arr) => (
            <>
              <div
                key={idx}
                className="wsn fcc bg-background rounded-lg shadow px-4 py-2 fz22 fw700 landing-page-text2"
                style={{
                  minWidth: 48,
                  width: 48,
                  textAlign: "center",
                  color: ensureValidHexColor(promotionTextColor),
                }}
              >
                {unit}
              </div>
              {idx < arr.length - 1 && (
                <span
                  className="fz22 fw700 landing-page-text2 mx-1"
                  style={{ color: ensureValidHexColor(promotionTextColor) }}
                >
                  :
                </span>
              )}
            </>
          )
        )}
      </div>
      <style jsx>{`
        .promotion-countdown-box {
          min-width: 48px;
        }
      `}</style>
    </div>
  );
}
