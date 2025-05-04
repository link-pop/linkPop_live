"use client";

import { useTranslation } from "@/components/Context/TranslationContext";
import {
  Link2,
  Calendar,
  Users,
  Clock,
  Calendar as CalendarIcon,
  Activity,
} from "lucide-react";

// ! code start AnalyticsCards
export default function AnalyticsCards({
  activeLinks,
  totalLinks,
  monthlyVisitors,
  totalVisitors,
  todayVisitors,
  yesterdayVisitors,
  last7DaysVisitors,
  type,
  stats,
}) {
  const { t } = useTranslation();

  // Determine labels based on type
  const linkTypeLabel =
    type === "directlink" ? t("allDirectLinks") : t("allLandingPages");

  // Get month name and year from stats, or use fallbacks
  const monthName = stats?.targetMonthName || "Upcoming";
  const targetYear = stats?.targetYear || new Date().getFullYear();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
      {/* Links Card */}
      <div className="bg-background rounded-lg shadow p-3 dark:shadow-lg dark:shadow-[#57575710] ">
        <div className="mb-1">
          <Link2 className="h-4 w-4 text-primary" />
        </div>
        <h3 className="text-sm font-medium text-muted-foreground">
          {linkTypeLabel}
        </h3>
        <div className="mt-1">
          <p className="text-xl font-bold">
            {activeLinks} / {totalLinks}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("activeLinks")}
          </p>
        </div>
      </div>

      {/* Today Analytics Card */}
      <div className="bg-background rounded-lg shadow p-3 dark:shadow-lg dark:shadow-[#57575710] ">
        <div className="mb-1">
          <Clock className="h-4 w-4 text-emerald-500" />
        </div>
        <h3 className="text-sm font-medium text-muted-foreground">
          {t("todayAnalytics")}
        </h3>
        <div className="mt-1">
          <p className="text-xl font-bold">{todayVisitors.toLocaleString()}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("visitorsToday")}
          </p>
        </div>
      </div>

      {/* Yesterday Analytics Card */}
      <div className="bg-background rounded-lg shadow p-3 dark:shadow-lg dark:shadow-[#57575710] ">
        <div className="mb-1">
          <CalendarIcon className="h-4 w-4 text-amber-500" />
        </div>
        <h3 className="text-sm font-medium text-muted-foreground">
          {t("yesterdayAnalytics")}
        </h3>
        <div className="mt-1">
          <p className="text-xl font-bold">
            {yesterdayVisitors.toLocaleString()}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("visitorsYesterday")}
          </p>
        </div>
      </div>

      {/* Last 7 Days Analytics Card */}
      <div className="bg-background rounded-lg shadow p-3 dark:shadow-lg dark:shadow-[#57575710] ">
        <div className="mb-1">
          <Activity className="h-4 w-4 text-blue-500" />
        </div>
        <h3 className="text-sm font-medium text-muted-foreground">
          {t("sevenDaysAnalytics")}
        </h3>
        <div className="mt-1">
          <p className="text-xl font-bold">
            {last7DaysVisitors.toLocaleString()}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("lastSevenDaysVisitors")}
          </p>
        </div>
      </div>

      {/* Monthly Analytics Card */}
      <div className="bg-background rounded-lg shadow p-3 dark:shadow-lg dark:shadow-[#57575710] ">
        <div className="mb-1">
          <Calendar className="h-4 w-4 text-indigo-500" />
        </div>
        <h3 className="text-sm font-medium text-muted-foreground">
          {t("monthlyAnalytics")}
        </h3>
        <div className="mt-1">
          <p className="text-xl font-bold">
            {monthlyVisitors.toLocaleString()}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("visitorsInMonth")} {monthName} {targetYear}
          </p>
        </div>
      </div>

      {/* All Time Analytics Card */}
      <div className="bg-background rounded-lg shadow p-3 dark:shadow-lg dark:shadow-[#57575710] ">
        <div className="mb-1">
          <Users className="h-4 w-4 text-green-500" />
        </div>
        <h3 className="text-sm font-medium text-muted-foreground">
          {t("allTimeAnalytics")}
        </h3>
        <div className="mt-1">
          <p className="text-xl font-bold">{totalVisitors.toLocaleString()}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("totalVisitors")}
          </p>
        </div>
      </div>
    </div>
  );
}
// ? code end AnalyticsCards
