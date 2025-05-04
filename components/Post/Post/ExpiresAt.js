"use client";

import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

export default function ExpiresAt({ post, className = "" }) {
  const [timeLeft, timeLeftSet] = useState("");

  useEffect(() => {
    function updateTimeLeft() {
      if (!post?.expirationPeriod) return;

      const expirationMs = post.expirationPeriod * 24 * 60 * 60 * 1000;
      const createdAt = new Date(post.createdAt).getTime();
      const expiresAt = createdAt + expirationMs;
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
  }, [post?.expirationPeriod, post?.createdAt]);

  if (!timeLeft) return null;

  return (
    <div title="expiration time" className={`f aic g5 fz14 gray ${className}`}>
      <Clock size={16} />
      <span>{timeLeft}</span>
    </div>
  );
}
