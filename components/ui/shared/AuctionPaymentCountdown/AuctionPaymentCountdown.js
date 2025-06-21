"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { useTranslation } from "@/components/Context/TranslationContext";

export default function AuctionPaymentCountdown({ notificationCreatedAt }) {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!notificationCreatedAt) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const createdAt = new Date(notificationCreatedAt);
      const deadline = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from notification creation
      const difference = deadline.getTime() - now.getTime();

      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft(null);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
      setIsExpired(false);
    };

    // Calculate initial time
    calculateTimeLeft();

    // Update every second
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [notificationCreatedAt]);

  if (!notificationCreatedAt) {
    return null;
  }

  if (isExpired) {
    return (
      <div className="mt10 px12 py8 bg-red-50 border border-red-200 rounded-lg f aic g8 text-sm">
        <Clock className="w16 h16 text-red-600" />
        <span className="text-red-700 font-medium">
          {t("paymentDeadlineExpired")}
        </span>
      </div>
    );
  }

  if (!timeLeft) {
    return (
      <div className="mt10 px12 py8 bg-muted rounded-lg f aic g8 text-sm">
        <Clock className="w16 h16 text-muted-foreground" />
        <span className="text-muted-foreground">
          {t("calculatingTimeLeft")}
        </span>
      </div>
    );
  }

  const formatTimeLeft = () => {
    const parts = [];

    if (timeLeft.days > 0) {
      parts.push(`${timeLeft.days}${t("daysShort")}`);
    }
    if (timeLeft.hours > 0) {
      parts.push(`${timeLeft.hours}${t("hoursShort")}`);
    }
    if (timeLeft.minutes > 0) {
      parts.push(`${timeLeft.minutes}${t("minutesShort")}`);
    }
    if (timeLeft.days === 0 && timeLeft.hours === 0) {
      parts.push(`${timeLeft.seconds}${t("secondsShort")}`);
    }

    return parts.join(" ");
  };

  const getUrgencyColor = () => {
    const totalHours = timeLeft.days * 24 + timeLeft.hours;

    if (totalHours < 24) {
      return "text-red-600 bg-red-50 border-red-200"; // Less than 1 day - red
    } else if (totalHours < 48) {
      return "text-orange-600 bg-orange-50 border-orange-200"; // Less than 2 days - orange
    } else {
      return "text-blue-600 bg-blue-50 border-blue-200"; // More than 2 days - blue
    }
  };

  return (
    <div
      className={`mt10 px12 py8 border rounded-lg f aic g8 text-sm ${getUrgencyColor()}`}
    >
      <Clock className="w16 h16" />
      <>
        <div className="fc g2">
          <span className="font-medium">
            {t("timeLeftToPay")}: {formatTimeLeft()}
          </span>
          <span className="text-xs opacity-80">
            {t("paymentDeadlineWarning")}
          </span>
        </div>
        <p className="bad fw300 fz12 text-muted-foreground">
          {t("ifDenyToBuyAuctionItem")}
        </p>
      </>
    </div>
  );
}
