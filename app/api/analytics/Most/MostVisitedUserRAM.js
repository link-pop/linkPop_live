"use client";

import AnalyticsCard from "@/app/api/analytics/Most/AnalyticsCard";

export default function MostVisitedUserRAM({ analytics }) {
  const ramStats = analytics.reduce(
    (acc, item) => {
      const ram = item?.deviceMemory || "";

      if (ram && ram !== "unknown") {
        if (!acc[ram]) {
          acc[ram] = 0;
        }
        acc[ram]++;
      }
      return acc;
    },
    {
      2: 0,
      4: 0,
      8: 0,
      16: 0,
      32: 0,
      64: 0,
    }
  );

  const totalVisits = Object.values(ramStats).reduce((a, b) => a + b, 0);

  const ramData = Object.entries(ramStats)
    .map(([ram, visits]) => ({
      key: ram,
      label: `${ram} GB`,
      icon: "💾",
      percentage:
        totalVisits === 0 ? "0.0" : ((visits / totalVisits) * 100).toFixed(1),
    }))
    .sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));

  return <AnalyticsCard title="RAM Size" data={ramData} />;
}
