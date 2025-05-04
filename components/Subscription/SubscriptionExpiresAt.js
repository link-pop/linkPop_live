"use client";

import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

// TODO !!!!!! use ExpiresAt comp!
export default function SubscriptionExpiresAt({
  subscription,
  className = "",
}) {
  const [timeLeft, timeLeftSet] = useState("");

  useEffect(() => {
    function updateTimeLeft() {
      if (!subscription?.expiresAt) return;

      const expiresAt = new Date(subscription.expiresAt).getTime();
      const now = Date.now();
      const timeLeftMs = expiresAt - now;

      if (timeLeftMs <= 0) {
        timeLeftSet("");
        return;
      }

      const days = Math.floor(timeLeftMs / (24 * 60 * 60 * 1000));
      const hours = Math.floor(
        (timeLeftMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)
      );

      let text = "";
      if (days > 0) {
        text = `${days}d`;
        if (hours > 0) text += ` ${hours}h`;
      } else if (hours > 0) {
        text = `${hours}h`;
      } else {
        const minutes = Math.floor(
          (timeLeftMs % (60 * 60 * 1000)) / (60 * 1000)
        );
        text = `${minutes}m`;
      }

      timeLeftSet(text);
    }

    updateTimeLeft();
  }, [subscription?.expiresAt]);

  if (!timeLeft) return null;

  return (
    <div
      title="subscription time left"
      className={`poa -b20 cx f fwn wsn aic g5 fz12 brand ${className}`}
    >
      <Clock size={14} />
      <span>{timeLeft}</span>
    </div>
  );
}
