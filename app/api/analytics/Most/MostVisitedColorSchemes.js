import AnalyticsCard from "./AnalyticsCard";

export default function MostVisitedColorSchemes({ analytics }) {
  const colorStats = analytics.reduce(
    (acc, item) => {
      const color = item?.colorScheme || "";
      if (color) {
        if (!acc[color]) {
          acc[color] = {
            count: 0,
          };
        }
        acc[color].count++;
      }
      return acc;
    },
    {
      dark: { count: 0 },
      light: { count: 0 },
    }
  );

  const totalVisits = Object.values(colorStats).reduce(
    (a, b) => a + b.count,
    0
  );

  const colorSchemesData = Object.entries(colorStats)
    .map(([color, stats]) => ({
      key: color,
      label: color,
      icon: color === "dark" ? "🖤" : "🤍",
      percentage:
        totalVisits === 0
          ? "0.0"
          : ((stats.count / totalVisits) * 100).toFixed(1),
    }))
    .sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));

  return <AnalyticsCard title="Color Schemes" data={colorSchemesData} />;
}
