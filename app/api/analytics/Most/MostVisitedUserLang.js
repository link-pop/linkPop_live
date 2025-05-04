"use client";

import AnalyticsCard from "@/app/api/analytics/Most/AnalyticsCard";

export default function MostVisitedUserLang({ analytics }) {
  const langStats = analytics.reduce(
    (acc, item) => {
      const lang = item?.language?.toLowerCase() || "";

      if (lang && lang !== "unknown") {
        if (!acc[lang]) {
          acc[lang] = 0;
        }
        acc[lang]++;
      }
      return acc;
    },
    {
      "en-us": 0,
      es: 0,
      fr: 0,
      de: 0,
      ja: 0,
      ua: 0,
    }
  );

  const totalVisits = Object.values(langStats).reduce((a, b) => a + b, 0);

  const langData = Object.entries(langStats)
    .map(([lang, visits]) => ({
      key: lang,
      label: lang.toUpperCase(),
      icon: "🌐",
      percentage:
        totalVisits === 0 ? "0.0" : ((visits / totalVisits) * 100).toFixed(1),
    }))
    .sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));

  return <AnalyticsCard title="Languages" data={langData} />;
}
