"use client";

import { getSystemEmoji } from "@/lib/utils/getSystemInfo";
import AnalyticsCard from "@/app/api/analytics/Most/AnalyticsCard";

export default function MostVisitedSystems({ analytics }) {
  const systemStats = analytics.reduce(
    (acc, item) => {
      const { systemType } = item;
      if (!systemType) return acc;

      if (!acc[systemType]) {
        acc[systemType] = 0;
      }
      acc[systemType]++;
      return acc;
    },
    {
      Windows: 0,
      MacOS: 0,
      Linux: 0,
      Android: 0,
      iOS: 0,
      Unknown: 0,
    }
  );

  const totalVisits = Object.values(systemStats).reduce((a, b) => a + b, 0);

  const systemsData = Object.entries(systemStats)
    .map(([system, visits]) => ({
      key: system,
      label: system,
      icon: getSystemEmoji(system),
      percentage:
        totalVisits === 0 ? "0.0" : ((visits / totalVisits) * 100).toFixed(1),
    }))
    .sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));

  return <AnalyticsCard title="OS" data={systemsData} />;
}
