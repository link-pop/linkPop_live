import AnalyticsCard from "@/app/api/analytics/Most/AnalyticsCard";

export default function MostVisitedTimeZones({ analytics }) {
  const timeZoneStats = analytics.reduce(
    (acc, item) => {
      const timeZone = item?.timeZone || "";

      if (timeZone) {
        if (!acc[timeZone]) {
          acc[timeZone] = 0;
        }
        acc[timeZone]++;
      }
      return acc;
    },
    {
      "Europe/London": 0,
      "America/Toronto": 0,
      "Australia/Sydney": 0,
      "Asia/Tokyo": 0,
    }
  );

  const totalVisits = Object.values(timeZoneStats).reduce((a, b) => a + b, 0);

  // ! getOffset
  const getOffset = (timeZone) => {
    const date = new Date();
    const utcDate = new Date(date.toUTCString());
    const localDate = new Date(date.toLocaleString("en-US", { timeZone }));
    let offset = (localDate.getTime() - utcDate.getTime()) / 3600000;
    offset = offset + 2; // ! HACK
    return `UTC${offset >= 0 ? "+" : ""}${offset}`;
  };

  const timeZoneData = Object.entries(timeZoneStats)
    .map(([timeZone, visits]) => ({
      key: timeZone,
      label: timeZone + ` (${getOffset(timeZone)})`,
      icon: "🕒",
      percentage:
        totalVisits === 0 ? "0.0" : ((visits / totalVisits) * 100).toFixed(1),
    }))
    .sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));

  return <AnalyticsCard title="Time Zones" data={timeZoneData} />;
}
