import AdminPageHeader from "@/components/ui/admin/AdminPageHeader";
import { getAll } from "@/lib/actions/crud";
import AdminAnalyticsClient from "./components/AdminAnalyticsClient";

export default async function AdminAnalyticsPage() {
  // Get all directlinks with explicit population to ensure complete data
  const directlinks = await getAll({
    col: "directlinks",
    sort: { createdAt: -1 },
    populate: [{ path: "createdBy", select: "name" }],
  });

  // Get all landing pages with explicit population to ensure complete data
  const landingpages = await getAll({
    col: "landingpages",
    sort: { createdAt: -1 },
    populate: [{ path: "createdBy", select: "name" }],
  });

  // Log total count for debugging
  console.log(`Total directlinks fetched: ${directlinks.length}`);
  console.log(`Total landingpages fetched: ${landingpages.length}`);

  // Get visitor data for all directlinks without limit
  const visitorCollection = "s2profilevisitors";
  const directlinkVisitors = await getAll({
    col: visitorCollection,
    data: { profileType: "directlink" },
    sort: { createdAt: -1 },
  });

  // Get visitor data for all landing pages without limit
  const landingpageVisitors = await getAll({
    col: visitorCollection,
    data: { profileType: "landingpage" },
    sort: { createdAt: -1 },
  });

  // Log visitor count for debugging
  console.log(
    `Total directlink visitors fetched: ${directlinkVisitors.length}`
  );
  console.log(
    `Total landingpage visitors fetched: ${landingpageVisitors.length}`
  );

  // Calculate stats for directlinks
  const totalDirectlinks = directlinks.length;
  const totalActiveDirectlinks = directlinks.filter(
    (link) => link.active
  ).length;

  // Calculate stats for landing pages
  const totalLandingPages = landingpages.length;
  const totalActiveLandingPages = landingpages.filter(
    (page) => page.active
  ).length;

  // Set up date ranges for filtering
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Yesterday date range
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Last 7 days date range
  const last7Days = new Date(today);
  last7Days.setDate(last7Days.getDate() - 7);

  // Current month date range
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const startDate = new Date(currentYear, currentMonth, 1); // First day of current month
  const endDate = new Date(currentYear, currentMonth + 1, 0); // Last day of current month

  // Filter visitors for today
  const todayDirectlinkVisitors = directlinkVisitors.filter((visitor) => {
    if (!visitor.createdAt) return false;
    const visitDate = new Date(visitor.createdAt);
    return visitDate >= today && visitDate < tomorrow;
  });

  const todayLandingpageVisitors = landingpageVisitors.filter((visitor) => {
    if (!visitor.createdAt) return false;
    const visitDate = new Date(visitor.createdAt);
    return visitDate >= today && visitDate < tomorrow;
  });

  // Filter visitors for yesterday
  const yesterdayDirectlinkVisitors = directlinkVisitors.filter((visitor) => {
    if (!visitor.createdAt) return false;
    const visitDate = new Date(visitor.createdAt);
    return visitDate >= yesterday && visitDate < today;
  });

  const yesterdayLandingpageVisitors = landingpageVisitors.filter((visitor) => {
    if (!visitor.createdAt) return false;
    const visitDate = new Date(visitor.createdAt);
    return visitDate >= yesterday && visitDate < today;
  });

  // Filter visitors for last 7 days
  const last7DaysDirectlinkVisitors = directlinkVisitors.filter((visitor) => {
    if (!visitor.createdAt) return false;
    const visitDate = new Date(visitor.createdAt);
    return visitDate >= last7Days && visitDate < tomorrow;
  });

  const last7DaysLandingpageVisitors = landingpageVisitors.filter((visitor) => {
    if (!visitor.createdAt) return false;
    const visitDate = new Date(visitor.createdAt);
    return visitDate >= last7Days && visitDate < tomorrow;
  });

  // Filter visitors for the current month
  const currentMonthDirectlinkVisitors = directlinkVisitors.filter(
    (visitor) => {
      if (!visitor.createdAt) return false;
      const visitDate = new Date(visitor.createdAt);
      return visitDate >= startDate && visitDate <= endDate;
    }
  );

  const currentMonthLandingpageVisitors = landingpageVisitors.filter(
    (visitor) => {
      if (!visitor.createdAt) return false;
      const visitDate = new Date(visitor.createdAt);
      return visitDate >= startDate && visitDate <= endDate;
    }
  );

  // Group visitors by directlink
  const visitorsByDirectlink = {};
  directlinkVisitors.forEach((visitor) => {
    if (!visitor.profileId) return;
    const directlinkId = visitor.profileId.toString();
    if (!visitorsByDirectlink[directlinkId]) {
      visitorsByDirectlink[directlinkId] = [];
    }
    visitorsByDirectlink[directlinkId].push(visitor);
  });

  // Group visitors by landing page
  const visitorsByLandingPage = {};
  landingpageVisitors.forEach((visitor) => {
    if (!visitor.profileId) return;
    const landingPageId = visitor.profileId.toString();
    if (!visitorsByLandingPage[landingPageId]) {
      visitorsByLandingPage[landingPageId] = [];
    }
    visitorsByLandingPage[landingPageId].push(visitor);
  });

  // Log the number of unique profiles that have visitors
  console.log(
    `Unique directlinks with visitors: ${
      Object.keys(visitorsByDirectlink).length
    }`
  );
  console.log(
    `Unique landingpages with visitors: ${
      Object.keys(visitorsByLandingPage).length
    }`
  );

  // Get the month name for the current month
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const currentMonthName = monthNames[currentMonth];

  // Prepare data for client components
  const directlinksData = {
    directlinks,
    visitors: directlinkVisitors,
    visitorsByDirectlink,
    stats: {
      activeLinks: totalActiveDirectlinks,
      totalLinks: totalDirectlinks,
      todayVisitors: todayDirectlinkVisitors.length,
      yesterdayVisitors: yesterdayDirectlinkVisitors.length,
      last7DaysVisitors: last7DaysDirectlinkVisitors.length,
      monthlyVisitors: currentMonthDirectlinkVisitors.length,
      totalVisitors: directlinkVisitors.length,
      targetMonthName: currentMonthName,
      targetYear: currentYear,
    },
  };

  const landingpagesData = {
    landingpages,
    visitors: landingpageVisitors,
    visitorsByLandingPage,
    stats: {
      activeLinks: totalActiveLandingPages,
      totalLinks: totalLandingPages,
      todayVisitors: todayLandingpageVisitors.length,
      yesterdayVisitors: yesterdayLandingpageVisitors.length,
      last7DaysVisitors: last7DaysLandingpageVisitors.length,
      monthlyVisitors: currentMonthLandingpageVisitors.length,
      totalVisitors: landingpageVisitors.length,
      targetMonthName: currentMonthName,
      targetYear: currentYear,
    },
  };

  return (
    <div className="p-3 md:p-6">
      <AdminPageHeader />
      <div className="oxh bg-background rounded-lg shadow p15 p-3 md:p-6">
        <AdminAnalyticsClient
          directlinksData={directlinksData}
          landingpagesData={landingpagesData}
        />
      </div>
    </div>
  );
}
