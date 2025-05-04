"use client";

import AnalyticsCard from "@/app/api/analytics/Most/AnalyticsCard";

export default function MostVisitedEmailProviders({ analytics }) {
  const emailStats = analytics.reduce(
    (acc, item) => {
      const email = item?.email || "";
      const provider = email.split("@")[1]?.toLowerCase();

      if (provider && provider !== "unknown") {
        if (!acc[provider]) {
          acc[provider] = 0;
        }
        acc[provider]++;
      }
      return acc;
    },
    {
      "gmail.com": 0,
      "yahoo.com": 0,
      "hotmail.com": 0,
      "outlook.com": 0,
      "icloud.com": 0,
      "mail.com": 0,
    }
  );

  const totalVisits = Object.values(emailStats).reduce((a, b) => a + b, 0);

  const emailProvidersData = Object.entries(emailStats)
    .map(([provider, visits]) => ({
      key: provider,
      label: provider,
      icon: "📧",
      percentage:
        totalVisits === 0 ? "0.0" : ((visits / totalVisits) * 100).toFixed(1),
    }))
    .sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));

  return <AnalyticsCard title="Email Providers" data={emailProvidersData} />;
}
