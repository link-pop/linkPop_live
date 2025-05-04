"use client";

import { getPlatformEmoji } from "@/lib/utils/getPlatformInfo";
import AnalyticsCard from "@/app/api/analytics/Most/AnalyticsCard";

export default function MostVisitedPlatforms({ analytics }) {
  const platformStats = analytics.reduce(
    (acc, item) => {
      const { platformType } = item;
      if (!platformType) return acc;

      if (!acc[platformType]) {
        acc[platformType] = 0;
      }
      acc[platformType]++;
      return acc;
    },
    {
      desktop: 0,
      laptop: 0,
      mobile: 0,
      tablet: 0,
      tv: 0,
      smartwatch: 0,
    }
  );

  const totalVisits = Object.values(platformStats).reduce((a, b) => a + b, 0);

  const platformsData = Object.entries(platformStats)
    .map(([platform, visits]) => ({
      key: platform,
      label: platform,
      icon: getPlatformEmoji(platform),
      percentage:
        totalVisits === 0 ? "0.0" : ((visits / totalVisits) * 100).toFixed(1),
    }))
    .sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));

  return <AnalyticsCard title="Platforms" data={platformsData} />;
}
