"use client";

import AnalyticsCard from "@/app/api/analytics/Most/AnalyticsCard";

export default function MostVisitedCountries({ analytics }) {
  const countryStats = analytics.reduce(
    (acc, item) => {
      const { countryCode } = item;
      if (!countryCode) return acc;

      if (!acc[countryCode]) {
        acc[countryCode] = 0;
      }
      acc[countryCode]++;
      return acc;
    },
    {
      US: 0,
      CA: 0,
      GB: 0,
      BR: 0,
      MX: 0,
      FR: 0,
      DE: 0,
    }
  );

  const totalVisits = Object.values(countryStats).reduce((a, b) => a + b, 0);

  const countriesData = Object.entries(countryStats)
    .map(([code, visits]) => ({
      key: code,
      label: code,
      icon: (
        <img
          src={`https://flagcdn.com/w320/${code.toLowerCase()}.png`}
          alt={code}
          className="w-6 h-4 object-cover"
        />
      ),
      percentage:
        totalVisits === 0 ? "0.0" : ((visits / totalVisits) * 100).toFixed(1),
    }))
    .sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));

  return <AnalyticsCard title="Countries" data={countriesData} />;
}
