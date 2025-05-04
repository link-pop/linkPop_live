"use client";

import { useTranslation } from "@/components/Context/TranslationContext";
import {
  Users,
  Clock,
  ChartBar,
  Calendar,
  TrendingUp,
  Globe,
  Zap,
  BarChart3,
  MousePointer,
  ExternalLink,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getSocialMediaLinks } from "@/lib/actions/getSocialMediaLinks";

export default function UnifiedStatsDashboard({
  visitors,
  profileId,
  landingPageId = null,
  profileType = "profile",
  isDemoMode = false,
  demoLinks = [],
  totalClicks = 0,
}) {
  const { t } = useTranslation();
  const isDirectLink = profileType === "directlink";

  // Use React Query for social links data fetching - only when not in demo mode
  const { data: socialLinks = [], isLoading } = useQuery({
    queryKey: ["socialMediaLinks", profileId, landingPageId],
    queryFn: () => getSocialMediaLinks(profileId, landingPageId),
    enabled: !!profileId && !isDirectLink && !isDemoMode, // Don't fetch social links for direct links or in demo mode
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Calculate total link clicks - use demo links in demo mode
  const linksToUse = isDemoMode ? demoLinks : socialLinks;
  const calculatedTotalClicks =
    isDemoMode && totalClicks > 0
      ? totalClicks
      : linksToUse.reduce((sum, link) => sum + (link.clickCount || 0), 0);

  // Calculate total visits
  const totalVisits = visitors.length;

  // Count unique visitors by IP address for more accurate visitor count
  const uniqueIPs = new Set(
    visitors.filter((v) => v.ipAddress).map((v) => v.ipAddress)
  ).size;

  // Calculate visits in the last 24 hours
  const last24Hours = new Date();
  last24Hours.setHours(last24Hours.getHours() - 24);
  const visitsLast24Hours = visitors.filter(
    (v) => new Date(v.createdAt) > last24Hours
  ).length;

  // Calculate visits in the last 7 days
  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);
  const visitsLast7Days = visitors.filter(
    (v) => new Date(v.createdAt) > last7Days
  ).length;

  // Calculate visit timestamps and organize by day for daily averages
  const visitsByDay = {};
  visitors.forEach((visit) => {
    if (!visit.createdAt) return;

    const date = new Date(visit.createdAt);
    const dayKey = date.toISOString().split("T")[0]; // YYYY-MM-DD format

    if (!visitsByDay[dayKey]) {
      visitsByDay[dayKey] = 1;
    } else {
      visitsByDay[dayKey]++;
    }
  });

  // Calculate average visits per active period (only count days with at least one visit)
  const activeVisitDays = Object.keys(visitsByDay).length;

  // Find the peak visit day (day with most visits)
  let peakDay = null;
  let peakVisits = 0;

  Object.entries(visitsByDay).forEach(([day, count]) => {
    if (count > peakVisits) {
      peakDay = day;
      peakVisits = count;
    }
  });

  // Format peak day for display
  const peakDayFormatted = peakDay
    ? new Date(peakDay).toLocaleDateString(navigator.language, {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : "N/A";

  // Calculate visitor trend for today compared to yesterday
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const visitsToday = visitors.filter(
    (v) => new Date(v.createdAt) >= today
  ).length;

  const visitsYesterday = visitors.filter((v) => {
    const visitDate = new Date(v.createdAt);
    return visitDate >= yesterday && visitDate < today;
  }).length;

  // Calculate visitor trend percentage
  let visitorTrend = "new";

  if (visitsYesterday > 0) {
    // Calculate percentage increase compared to yesterday
    visitorTrend = Math.round(
      ((visitsToday - visitsYesterday) / visitsYesterday) * 100
    );
  } else if (visitsToday > 0) {
    // If yesterday had 0 visits and today has visits, show large increase
    visitorTrend = visitsToday * 100; // Each visitor represents 100% increase
  }

  const visitorTrendLabel =
    visitorTrend === "new" ? "New!" : `+${Math.abs(visitorTrend)}%`;

  // Calculate unique countries from visitor data
  const uniqueCountries = new Set(
    visitors.filter((v) => v.country_code).map((v) => v.country_code)
  ).size;

  // Calculate click rate (percentage of visits that resulted in a click)
  const clickRate =
    totalVisits > 0
      ? Math.round((calculatedTotalClicks / totalVisits) * 100)
      : 0;

  // Calculate clicks per unique visitor
  const clicksPerUser =
    uniqueIPs > 0 ? (calculatedTotalClicks / uniqueIPs).toFixed(1) : "0.0";

  // Average visits per day (last 7 days)
  const last7DayVisitDays = Object.keys(visitsByDay).filter((day) => {
    const dayDate = new Date(day);
    return dayDate >= last7Days;
  }).length;

  const avgVisitsPerDay =
    last7DayVisitDays > 0
      ? (visitsLast7Days / (last7DayVisitDays || 7)).toFixed(1)
      : "0.0";

  return (
    <div
      className={`bg-background rounded-lg border border-border shadow-md p-4 transition-all duration-300 hover:shadow-lg mb-6`}
    >
      <h2
        className={`text-lg font-semibold text-foreground flex items-center mb-4`}
      >
        <BarChart3 size={20} className="mr-2 text-foreground" />
        {t("visitorOverview")}
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {/* Total Visits */}
        <div
          className={`bg-muted/30 rounded-lg p-3 border border-border/50 shadow-sm`}
        >
          <h3
            className={`text-xs font-medium text-muted-foreground mb-1 flex items-center`}
          >
            <ChartBar
              size={16}
              className="mr-1.5 text-foreground"
              stroke-width={2.5}
            />
            {t("totalVisits")}
          </h3>
          <p className={`text-xl font-bold text-foreground`}>{totalVisits}</p>
        </div>

        {/* Unique Visitors */}
        <div
          className={`bg-muted/30 rounded-lg p-3 border border-border/50 shadow-sm`}
        >
          <h3
            className={`text-xs font-medium text-muted-foreground mb-1 flex items-center`}
          >
            <Users
              size={16}
              className="mr-1.5 text-foreground"
              stroke-width={2.5}
            />
            {t("uniqueVisitors")}
          </h3>
          <p className={`text-xl font-bold text-foreground`}>{uniqueIPs}</p>
        </div>

        {/* Last 24 Hours */}
        <div
          className={`bg-muted/30 rounded-lg p-3 border border-border/50 shadow-sm`}
        >
          <h3
            className={`text-xs font-medium text-muted-foreground mb-1 flex items-center`}
          >
            <Clock
              size={16}
              className="mr-1.5 text-foreground"
              stroke-width={2.5}
            />
            {t("last24Hours")}
          </h3>
          <p className={`text-xl font-bold text-foreground`}>
            {visitsLast24Hours}
          </p>
        </div>

        {/* Last 7 Days */}
        <div
          className={`bg-muted/30 rounded-lg p-3 border border-border/50 shadow-sm`}
        >
          <h3
            className={`text-xs font-medium text-muted-foreground mb-1 flex items-center`}
          >
            <Calendar
              size={16}
              className="mr-1.5 text-foreground"
              stroke-width={2.5}
            />
            {t("last7Days")}
          </h3>
          <p className={`text-xl font-bold text-foreground`}>
            {visitsLast7Days}
          </p>
        </div>

        {/* Visitor Trend */}
        <div
          className={`bg-muted/30 rounded-lg p-3 border border-border/50 shadow-sm`}
        >
          <h3
            className={`text-xs font-medium text-muted-foreground mb-1 flex items-center`}
          >
            <TrendingUp
              size={16}
              className="mr-1.5 text-foreground"
              stroke-width={2.5}
            />
            {t("visitorTrend")}
          </h3>
          <p className={`text-xl font-bold text-green-600`}>
            {visitorTrendLabel}
          </p>
        </div>

        {/* Peak Visit Day */}
        <div
          className={`bg-muted/30 rounded-lg p-3 border border-border/50 shadow-sm`}
        >
          <h3
            className={`text-xs font-medium text-muted-foreground mb-1 flex items-center`}
          >
            <Calendar
              size={16}
              className="mr-1.5 text-foreground"
              stroke-width={2.5}
            />
            {t("peakVisitDay")}
          </h3>
          <p className={`text-xl font-bold text-foreground`}>
            <span className="text-xl">{peakDayFormatted}</span>
            {peakVisits > 0 && (
              <span className="text-sm ml-1 font-normal text-muted-foreground">
                ({peakVisits})
              </span>
            )}
          </p>
        </div>

        {/* Average Visits Per Day */}
        <div
          className={`bg-muted/30 rounded-lg p-3 border border-border/50 shadow-sm`}
        >
          <h3
            className={`text-xs font-medium text-muted-foreground mb-1 flex items-center`}
          >
            <Zap
              size={16}
              className="mr-1.5 text-foreground"
              stroke-width={2.5}
            />
            {t("avgVisitsPerDay")}
          </h3>
          <p className={`text-xl font-bold text-foreground`}>
            {avgVisitsPerDay}
          </p>
        </div>

        {/* Click Rate - Only for non-direct links */}
        {!isDirectLink && (
          <div
            className={`bg-muted/30 rounded-lg p-3 border border-border/50 shadow-sm`}
          >
            <h3
              className={`text-xs font-medium text-muted-foreground mb-1 flex items-center`}
            >
              <MousePointer
                size={16}
                className="mr-1.5 text-foreground"
                stroke-width={2.5}
              />
              {t("clickRate")}
            </h3>
            <p className={`text-xl font-bold text-foreground`}>{clickRate}%</p>
          </div>
        )}

        {/* Clicks Per User - Only for non-direct links */}
        {!isDirectLink && (
          <div
            className={`bg-muted/30 rounded-lg p-3 border border-border/50 shadow-sm`}
          >
            <h3
              className={`text-xs font-medium text-muted-foreground mb-1 flex items-center`}
            >
              <ExternalLink
                size={16}
                className="mr-1.5 text-foreground"
                stroke-width={2.5}
              />
              {t("clicksPerUser")}
            </h3>
            <p className={`text-xl font-bold text-foreground`}>
              {clicksPerUser}
            </p>
          </div>
        )}

        {/* Unique Countries */}
        <div
          className={`bg-muted/30 rounded-lg p-3 border border-border/50 shadow-sm`}
        >
          <h3
            className={`text-xs font-medium text-muted-foreground mb-1 flex items-center`}
          >
            <Globe
              size={16}
              className="mr-1.5 text-foreground"
              stroke-width={2.5}
            />
            {t("countries")}
          </h3>
          <p className={`text-xl font-bold text-foreground`}>
            {uniqueCountries}
          </p>
        </div>
      </div>
    </div>
  );
}
