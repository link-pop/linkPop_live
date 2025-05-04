import AnalyticsCard from "./AnalyticsCard";

export default function MostVisitedCookiesEnabled({ analytics }) {
  const cookieStats = analytics.reduce(
    (acc, item) => {
      const cookie = item?.cookiesEnabled || "";
      if (cookie) {
        if (!acc[cookie]) {
          acc[cookie] = {
            count: 0,
          };
        }
        acc[cookie].count++;
      }
      return acc;
    },
    {
      disabled: { count: 0 },
      enabled: { count: 0 },
    }
  );

  const totalVisits = Object.values(cookieStats).reduce(
    (a, b) => a + b.count,
    0
  );

  const cookieSchemesData = Object.entries(cookieStats)
    .map(([cookie, stats]) => ({
      key: cookie,
      label: cookie,
      icon: cookie === "enabled" ? "🍪" : "🔒",
      percentage:
        totalVisits === 0
          ? "0.0"
          : ((stats.count / totalVisits) * 100).toFixed(1),
    }))
    .sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));

  return <AnalyticsCard title="Cookies" data={cookieSchemesData} />;
}
