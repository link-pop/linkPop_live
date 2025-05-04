"use client";

import AnalyticsCard from "@/app/api/analytics/Most/AnalyticsCard";

export default function MostVisitedScreenResolutions({ analytics }) {
  const resolutionStats = analytics.reduce(
    (acc, item) => {
      const resolution = item?.screenResolution?.toLowerCase() || "";

      if (resolution && resolution !== "unknown") {
        if (!acc[resolution]) {
          acc[resolution] = 0;
        }
        acc[resolution]++;
      }
      return acc;
    },
    {
      "1920x1080": 0,
      "1366x768": 0,
      "1440x900": 0,
      "1536x864": 0,
      "2560x1440": 0,
      "3840x2160": 0,
    }
  );

  const totalVisits = Object.values(resolutionStats).reduce((a, b) => a + b, 0);

  const resolutionData = Object.entries(resolutionStats)
    .map(([resolution, visits]) => ({
      key: resolution,
      label: resolution,
      icon: "🖥️",
      percentage:
        totalVisits === 0 ? "0.0" : ((visits / totalVisits) * 100).toFixed(1),
    }))
    .sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));

  return <AnalyticsCard title="Screen Size" data={resolutionData} />;
}
