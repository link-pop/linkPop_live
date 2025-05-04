"use client";

import { getBrowserEmoji } from "@/lib/utils/getBrowserInfo";
import AnalyticsCard from "@/app/api/analytics/Most/AnalyticsCard";

export default function MostVisitedBrowsers({ analytics }) {
  const browserStats = analytics.reduce(
    (acc, item) => {
      const { browserType } = item;
      if (!browserType) return acc;

      if (!acc[browserType]) {
        acc[browserType] = 0;
      }
      acc[browserType]++;
      return acc;
    },
    {
      Chrome: 0,
      Firefox: 0,
      Safari: 0,
      Edge: 0,
      Opera: 0,
      Other: 0,
    }
  );

  const totalVisits = Object.values(browserStats).reduce((a, b) => a + b, 0);

  const browsersData = Object.entries(browserStats)
    .map(([browser, visits]) => ({
      key: browser,
      label: browser,
      icon: getBrowserEmoji(browser),
      percentage:
        totalVisits === 0 ? "0.0" : ((visits / totalVisits) * 100).toFixed(1),
    }))
    .sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));

  return <AnalyticsCard title="Browsers" data={browsersData} />;
}
