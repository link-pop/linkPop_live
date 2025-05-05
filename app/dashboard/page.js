import { SITE2 } from "@/config/env";
import { getAll } from "@/lib/actions/crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import { redirect } from "next/navigation";
import DashboardClient from "./components/DashboardClient";
import { fetchUserSubscription2 } from "@/lib/actions/fetchUserSubscription2";
import UpgradeMessageCard from "@/components/ui/shared/UpgradeMessageCard";
import { checkFreePlanFeaturesLimit } from "@/lib/utils/checkFreePlanFeaturesLimit";

// ! code start DashboardPage
export default async function DashboardPage() {
  // Get the current user and ensure they're logged in
  const { mongoUser, isAdmin } = await getMongoUser();

  if (!mongoUser) {
    redirect("/");
  }

  // Only SITE2 has directlinks and landing pages
  if (!SITE2) {
    return null;
  }

  // Get user subscription status
  const userSubscription = await fetchUserSubscription2();

  // Log subscription details to help troubleshoot
  console.log("Dashboard - User Subscription:", {
    planId: userSubscription?.planId,
    status: userSubscription?.status,
    trialInfo:
      userSubscription?.status === "trialing"
        ? {
            trialDaysRemaining: userSubscription.trialDaysRemaining,
            trialEnd: userSubscription.trialEnd,
          }
        : null,
    rawSubscription: JSON.stringify(userSubscription).substring(0, 200) + "...",
  });

  // Check if user has required plan (agency) or is admin
  const hasAgencyPlan =
    userSubscription &&
    (userSubscription.planId === "agency" ||
      userSubscription.planId === "price_agency_monthly" ||
      (userSubscription.planId &&
        userSubscription.planId.toLowerCase().includes("agency")));

  // Extract extra links information if available
  const extraLinks =
    hasAgencyPlan && userSubscription.extraLinks
      ? userSubscription.extraLinks
      : 0;
  const totalLinks = hasAgencyPlan ? 50 + extraLinks : 0;

  // Get all directlinks and landingpages created by this user (prefer string fallback only)
  let directlinks = await getAll({
    col: "directlinks",
    data: { createdBy: mongoUser._id },
    sort: { createdAt: -1 },
  });
  if (directlinks.length === 0) {
    directlinks = await getAll({
      col: "directlinks",
      data: { createdBy: mongoUser._id.toString() },
      sort: { createdAt: -1 },
    });
  }

  let landingpages = await getAll({
    col: "landingpages",
    data: { createdBy: mongoUser._id },
    sort: { createdAt: -1 },
  });
  if (landingpages.length === 0) {
    landingpages = await getAll({
      col: "landingpages",
      data: { createdBy: mongoUser._id.toString() },
      sort: { createdAt: -1 },
    });
  }

  // Check dashboard access using the common function
  let dashboardAccess = {
    hasAccess: isAdmin || hasAgencyPlan, // Admins and agency plan users always have access
    isFreeTrialPeriod: false,
    daysRemaining: 0,
  };

  // Find the oldest content to check if in free trial period
  if (
    !dashboardAccess.hasAccess &&
    (directlinks.length > 0 || landingpages.length > 0)
  ) {
    // Get creation dates of all content
    const allCreationDates = [
      ...directlinks.map((item) => new Date(item.createdAt)),
      ...landingpages.map((item) => new Date(item.createdAt)),
    ].filter((date) => !isNaN(date.getTime())); // Filter out invalid dates

    if (allCreationDates.length > 0) {
      // Find the oldest content item
      const oldestDate = new Date(
        Math.min(...allCreationDates.map((date) => date.getTime()))
      );

      // Get the oldest item
      const oldestItem = [...directlinks, ...landingpages].find(
        (item) => new Date(item.createdAt).getTime() === oldestDate.getTime()
      );

      if (oldestItem) {
        // Use checkFreePlanFeaturesLimit for consistent behavior
        const accessCheck = await checkFreePlanFeaturesLimit({
          entityId: oldestItem._id,
          entityType: determineEntityType(oldestItem, directlinks),
          requiredPlan: "agency", // Dashboard requires agency plan
          collectionName: determineEntityType(oldestItem, directlinks),
        });

        // Calculate days remaining if in free trial period
        let daysRemaining = 0;
        if (accessCheck.isFreeTrialPeriod && accessCheck.timeRemainingMs) {
          daysRemaining = Math.ceil(
            accessCheck.timeRemainingMs / (1000 * 60 * 60 * 24)
          );
        }

        dashboardAccess = {
          ...accessCheck,
          daysRemaining,
          contentDate: oldestItem.createdAt,
        };
      }
    }
  }

  // If no access to dashboard, show upgrade card
  if (
    !dashboardAccess.hasAccess &&
    landingpages.length > 0 &&
    directlinks.length > 0
  ) {
    return (
      <UpgradeMessageCard
        title="analyticsDashboardAccessRequired"
        message="dashboardRequiresAgencyPlan"
        requiredPlan="agency"
        contentDate={dashboardAccess.contentDate}
        isFreeTrialPeriod={dashboardAccess.isFreeTrialPeriod}
        daysRemaining={dashboardAccess.daysRemaining}
        featureName="analyticsDashboard"
      />
    );
  }

  // Get visitor data for this user's directlinks
  const visitorCollection = "s2profilevisitors";
  const directlinkIds = directlinks.map((link) => link._id.toString());

  const directlinkVisitors = await getAll({
    col: visitorCollection,
    data: {
      profileType: "directlink",
      profileId: { $in: directlinkIds },
    },
    sort: { createdAt: -1 },
  });

  // Get visitor data for this user's landing pages
  const landingpageIds = landingpages.map((page) => page._id.toString());

  const landingpageVisitors = await getAll({
    col: visitorCollection,
    data: {
      profileType: "landingpage",
      profileId: { $in: landingpageIds },
    },
    sort: { createdAt: -1 },
  });

  // Group visitors by directlink
  const visitorsByDirectlink = {};
  for (const visitor of directlinkVisitors) {
    const linkId = visitor.profileId.toString();
    if (!visitorsByDirectlink[linkId]) {
      visitorsByDirectlink[linkId] = [];
    }
    visitorsByDirectlink[linkId].push(visitor);
  }

  // Group visitors by landing page
  const visitorsByLandingPage = {};
  for (const visitor of landingpageVisitors) {
    const pageId = visitor.profileId.toString();
    if (!visitorsByLandingPage[pageId]) {
      visitorsByLandingPage[pageId] = [];
    }
    visitorsByLandingPage[pageId].push(visitor);
  }

  // Set up date ranges for filtering
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const last7Days = new Date(today);
  last7Days.setDate(last7Days.getDate() - 7);

  const currentMonth = new Date(today);
  currentMonth.setDate(1);

  // Get month name for display
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
  const targetMonthName = monthNames[today.getMonth()];
  const targetYear = today.getFullYear();

  // Calculate directlinks stats
  const totalDirectlinks = directlinks.length;
  const totalActiveDirectlinks = directlinks.filter(
    (link) => link.active
  ).length;

  // Filter directlink visitors by date ranges
  const directlinkTodayVisitors = directlinkVisitors.filter(
    (v) => new Date(v.createdAt) >= today
  ).length;
  const directlinkYesterdayVisitors = directlinkVisitors.filter((v) => {
    const date = new Date(v.createdAt);
    return date >= yesterday && date < today;
  }).length;
  const directlinkLast7DaysVisitors = directlinkVisitors.filter(
    (v) => new Date(v.createdAt) >= last7Days
  ).length;
  const directlinkMonthlyVisitors = directlinkVisitors.filter(
    (v) => new Date(v.createdAt) >= currentMonth
  ).length;

  // Prepare directlinks stats object
  const directlinksStats = {
    totalLinks: totalDirectlinks,
    activeLinks: totalActiveDirectlinks,
    todayVisitors: directlinkTodayVisitors,
    yesterdayVisitors: directlinkYesterdayVisitors,
    last7DaysVisitors: directlinkLast7DaysVisitors,
    monthlyVisitors: directlinkMonthlyVisitors,
    totalVisitors: directlinkVisitors.length,
    targetMonthName,
    targetYear,
  };

  // Calculate landingpages stats
  const totalLandingPages = landingpages.length;
  const totalActiveLandingPages = landingpages.filter(
    (page) => page.active
  ).length;

  // Filter landing page visitors by date ranges
  const landingpageTodayVisitors = landingpageVisitors.filter(
    (v) => new Date(v.createdAt) >= today
  ).length;
  const landingpageYesterdayVisitors = landingpageVisitors.filter((v) => {
    const date = new Date(v.createdAt);
    return date >= yesterday && date < today;
  }).length;
  const landingpageLast7DaysVisitors = landingpageVisitors.filter(
    (v) => new Date(v.createdAt) >= last7Days
  ).length;
  const landingpageMonthlyVisitors = landingpageVisitors.filter(
    (v) => new Date(v.createdAt) >= currentMonth
  ).length;

  // Prepare landingpages stats object
  const landingpagesStats = {
    totalLinks: totalLandingPages,
    activeLinks: totalActiveLandingPages,
    todayVisitors: landingpageTodayVisitors,
    yesterdayVisitors: landingpageYesterdayVisitors,
    last7DaysVisitors: landingpageLast7DaysVisitors,
    monthlyVisitors: landingpageMonthlyVisitors,
    totalVisitors: landingpageVisitors.length,
    targetMonthName,
    targetYear,
  };

  // Prepare data for client component
  const directlinksData = {
    directlinks,
    visitors: directlinkVisitors,
    visitorsByDirectlink,
    stats: directlinksStats,
  };

  const landingpagesData = {
    landingpages,
    visitors: landingpageVisitors,
    visitorsByLandingPage,
    stats: landingpagesStats,
  };

  return (
    <div className="sm:p15">
      <DashboardClient
        mongoUser={mongoUser}
        {...{ directlinksData, landingpagesData }}
      />
    </div>
  );
}

// Helper function to determine entity type
function determineEntityType(item, directlinksList) {
  // First check if the item has a type property
  if (item.type) {
    return item.type;
  }

  // If no type, check if it's in the directlinks list
  const isDirectlink = directlinksList.some(
    (link) => link._id.toString() === item._id.toString()
  );

  return isDirectlink ? "directlinks" : "landingpages";
}
// ? code end DashboardPage
