import AnalyticsCard from "@/app/api/analytics/Most/AnalyticsCard";

// Processor Cores Count
export default function MostVisitedHardwareConcurrency({ analytics }) {
  const concurrencyStats = analytics.reduce(
    (acc, item) => {
      const concurrency = item?.hardwareConcurrency || 0;

      if (concurrency > 0) {
        if (!acc[concurrency]) {
          acc[concurrency] = 0;
        }
        acc[concurrency]++;
      }
      return acc;
    },
    {
      1: 0,
      2: 0,
      4: 0,
      6: 0,
      8: 0,
      16: 0,
      32: 0,
    }
  );

  const totalVisits = Object.values(concurrencyStats).reduce(
    (a, b) => a + b,
    0
  );

  const concurrencyData = Object.entries(concurrencyStats)
    .map(([concurrency, visits]) => ({
      key: concurrency,
      label: `${concurrency} Cores`,
      icon: "⚡",
      percentage:
        totalVisits === 0 ? "0.0" : ((visits / totalVisits) * 100).toFixed(1),
    }))
    .sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));

  return <AnalyticsCard title="CPU Cores" data={concurrencyData} />;
}
