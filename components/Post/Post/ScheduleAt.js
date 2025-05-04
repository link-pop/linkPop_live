"use client";

import { CalendarCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";

export default function ScheduleAt({ post, className = "" }) {
  const [timeLeft, timeLeftSet] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    function updateTimeLeft() {
      if (!post?.scheduleAt) return;

      const scheduleAt = new Date(post.scheduleAt).getTime();
      const now = Date.now();
      const timeLeftMs = scheduleAt - now;

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
        text = `${days}${t("day_short")}`;
        if (hours > 0) text += ` ${hours}${t("hour_short")}`;
      } else if (hours > 0) {
        text = `${hours}${t("hour_short")}`;
      } else {
        const minutes = Math.floor(
          (timeLeftMs % (60 * 60 * 1000)) / (60 * 1000)
        );
        text = `${minutes}${t("minute_short")}`;
      }

      timeLeftSet(text);
    }

    updateTimeLeft();
  }, [post?.scheduleAt, t]);

  if (!timeLeft) return null;

  return (
    <div
      title={t("scheduledToAppearIn")}
      className={`f aic g5 fz14 !bad ${className}`}
    >
      <CalendarCheck size={16} />
      <span>
        {t("in")} {timeLeft}
      </span>
    </div>
  );
}
