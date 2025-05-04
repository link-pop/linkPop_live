import AnalyticsCard from "./AnalyticsCard";

export default function MostVisitedUserStatus({ analytics }) {
  const userStats = analytics.reduce(
    (acc, item) => {
      if (item?.createdBy?._id) {
        if (!acc.authed) {
          acc.authed = { count: 0 };
        }
        acc.authed.count++;
      } else {
        if (!acc.anonymous) {
          acc.anonymous = { count: 0 };
        }
        acc.anonymous.count++;
      }
      return acc;
    },
    {
      authed: { count: 0 },
      anonymous: { count: 0 },
    }
  );

  const totalVisits = Object.values(userStats).reduce((a, b) => a + b.count, 0);

  const userSchemesData = Object.entries(userStats)
    .map(([user, stats]) => ({
      key: user,
      label: user,
      icon: user === "authed" ? "🧑" : "👽",
      percentage:
        totalVisits === 0
          ? "0.0"
          : ((stats.count / totalVisits) * 100).toFixed(1),
    }))
    .sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));

  return <AnalyticsCard title="User Status" data={userSchemesData} />;
}
