import AnalyticsCard from "./AnalyticsCard";

export default function MostVisitedReducedMotions({ analytics }) {
  const motionStats = analytics.reduce(
    (acc, item) => {
      const motion = item?.reducedMotion || "";
      if (motion) {
        if (!acc[motion]) {
          acc[motion] = {
            count: 0,
          };
        }
        acc[motion].count++;
      }
      return acc;
    },
    {
      disabled: { count: 0 }, // original name: reduce
      enabled: { count: 0 }, // original name: no-preference
    }
  );

  const totalVisits = Object.values(motionStats).reduce(
    (a, b) => a + b.count,
    0
  );

  const motionSchemesData = Object.entries(motionStats)
    .map(([motion, stats]) => ({
      key: motion,
      label: motion,
      icon: motion === "disabled" ? "🚶" : "🏃",
      percentage:
        totalVisits === 0
          ? "0.0"
          : ((stats.count / totalVisits) * 100).toFixed(1),
    }))
    .sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));

  return <AnalyticsCard title="Animations" data={motionSchemesData} />;
}
