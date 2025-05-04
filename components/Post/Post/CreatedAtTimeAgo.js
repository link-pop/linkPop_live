"use client";

import { useTranslation } from "@/components/Context/TranslationContext";

export default function CreatedAtTimeAgo({ createdAt, className = "" }) {
  // ! handles past and future time
  const { t } = useTranslation();

  function timeAgo(createdAt) {
    const now = new Date();
    const date = new Date(createdAt);
    const seconds = Math.floor((date - now) / 1000);
    const isPast = seconds < 0;
    const absoluteSeconds = Math.abs(seconds);

    const intervals = [
      { label: t("year_short"), seconds: 31536000 },
      { label: t("month_short"), seconds: 2592000 },
      { label: t("week_short"), seconds: 604800 },
      { label: t("day_short"), seconds: 86400 },
      { label: t("hour_short"), seconds: 3600 },
      { label: t("minute_short"), seconds: 60 },
      { label: t("second_short"), seconds: 1 },
    ];

    for (let i = 0; i < intervals.length; i++) {
      const interval = intervals[i];
      const count = Math.floor(absoluteSeconds / interval.seconds);
      if (count > 0) {
        if (isPast) {
          return `${count}${interval.label} ${t("ago")}`;
        } else {
          return `${t("in")} ${count}${interval.label}`;
        }
      }
    }

    return t("now");
  }

  return (
    <div
      title={t("createdTimeAgo")}
      className={`fz14 gray ${className}`}
      suppressHydrationWarning
    >
      {timeAgo(createdAt)}
    </div>
  );
}
