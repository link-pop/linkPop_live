"use client";

import { useTranslation } from "@/components/Context/TranslationContext";
import { Users, Clock, ChartBar, Calendar } from "lucide-react";

export default function ProfileVisitorStats({ visitors }) {
  const { t } = useTranslation();

  // Calculate stats from visitor data
  const totalVisits = visitors.length;

  // Count unique visitors by ID (primary key) instead of IP
  const uniqueVisitors = new Set(
    visitors.filter((v) => v._id).map((v) => v._id)
  ).size;

  // Calculate visits in the last 24 hours
  const last24Hours = new Date();
  last24Hours.setHours(last24Hours.getHours() - 24);
  const visitsLast24Hours = visitors.filter(
    (v) => new Date(v.createdAt) > last24Hours
  ).length;

  // Calculate average daily visits (in the last 7 days)
  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);
  const visitsLast7Days = visitors.filter(
    (v) => new Date(v.createdAt) > last7Days
  ).length;
  const avgDailyVisits = Math.round(visitsLast7Days / 7);

  return (
    <>
      <div
        className={`bg-muted/30 rounded-lg p-4 border border-border/50 shadow-sm`}
      >
        <h3
          className={`text-sm font-medium text-muted-foreground mb-1 flex items-center`}
        >
          <ChartBar size={16} className="mr-2 text-primary" />
          {t("totalVisits")}
        </h3>
        <p className={`text-2xl font-bold text-foreground`}>{totalVisits}</p>
      </div>

      <div
        className={`bg-muted/30 rounded-lg p-4 border border-border/50 shadow-sm`}
      >
        <h3
          className={`text-sm font-medium text-muted-foreground mb-1 flex items-center`}
        >
          <Users size={16} className="mr-2 text-primary" />
          {t("uniqueVisitors")}
        </h3>
        <p className={`text-2xl font-bold text-foreground`}>{uniqueVisitors}</p>
      </div>

      <div
        className={`bg-muted/30 rounded-lg p-4 border border-border/50 shadow-sm`}
      >
        <h3
          className={`text-sm font-medium text-muted-foreground mb-1 flex items-center`}
        >
          <Clock size={16} className="mr-2 text-primary" />
          {t("last24Hours")}
        </h3>
        <p className={`text-2xl font-bold text-foreground`}>
          {visitsLast24Hours}
        </p>
      </div>

      <div
        className={`bg-muted/30 rounded-lg p-4 border border-border/50 shadow-sm`}
      >
        <h3
          className={`text-sm font-medium text-muted-foreground mb-1 flex items-center`}
        >
          <Calendar size={16} className="mr-2 text-primary" />
          {t("avgDailyVisits")}
        </h3>
        <p className={`text-2xl font-bold text-foreground`}>{avgDailyVisits}</p>
      </div>
    </>
  );
}
