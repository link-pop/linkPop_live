import { getAll } from "@/lib/actions/crud";
import { getAllMongoCollectionsData } from "@/lib/utils/mongo/getAllMongoCollectionsData";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import { SITE1, SITE2 } from "@/config/env";
import ProfileVisitorStats from "./components/ProfileVisitorStats";
import VisitorTimeline from "./components/OneVisitorTimelineChart";
import GeoDistribution from "./components/GeoDistribution";
import DeviceAnalytics from "./components/DeviceAnalytics";
import ReferrerAnalytics from "./components/ReferrerAnalytics";
import { notFound, redirect } from "next/navigation";
import { LOGIN_ROUTE } from "@/lib/utils/constants";
import AdvancedVisitorInsights from "./components/AdvancedVisitorInsights";
import SocialLinksAnalytics from "@/components/Analytics/SocialLinksAnalytics";
import AnalyticsPageHeader from "./components/AnalyticsPageHeader";
import UnifiedStatsDashboard from "./components/UnifiedStatsDashboard";
import { fetchUserSubscription2 } from "@/lib/actions/fetchUserSubscription2";
import Link from "next/link";
import UpgradeMessageCard from "@/components/ui/shared/UpgradeMessageCard";
import { checkFreePlanFeaturesLimit } from "@/lib/utils/checkFreePlanFeaturesLimit";

export default async function AnalyticsPage({ params }) {
  // Get the current user and ensure they're logged in
  const { mongoUser, isAdmin } = await getMongoUser();
  if (!mongoUser) redirect(LOGIN_ROUTE);

  // Check user subscription status
  const userSubscription = await fetchUserSubscription2();

  // Initialize collections data early to avoid reference errors
  let userProfiles = [];
  let directlinks = [];
  let landingpages = [];

  // Log subscription details for debugging
  console.log("Analytics - User Subscription:", {
    planId: userSubscription?.planId,
    status: userSubscription?.status,
    profileName: params.col,
    hasSubscription: !!userSubscription,
  });

  // Determine which collection to use based on site type
  const visitorCollection = SITE1 ? "s1profilevisitors" : "s2profilevisitors";

  // Check if the requested route is a system collection for analytics
  const availableSystemCols = await getAllMongoCollectionsData();
  const systemColNames = availableSystemCols.map((col) => col.name);

  // If this is a special analytics page for a profile
  if (!systemColNames.includes(params.col)) {
    // Find the profile (user, directlink, or landing page)
    let profileData;
    let profileType;

    if (SITE2) {
      // On SITE2, check directlinks first
      profileData = await getAll({
        col: "directlinks",
        data: { name: params.col },
        limit: 1,
      });

      if (profileData.length > 0) {
        profileType = "directlink";
      } else {
        // Then check landing pages
        profileData = await getAll({
          col: "landingpages",
          data: { name: params.col },
          limit: 1,
        });

        if (profileData.length > 0) {
          profileType = "landingpage";
        }
      }
    }

    // If we didn't find a directlink or landing page or we're on SITE1, look for a user
    if (!profileData || profileData.length === 0) {
      profileData = await getAll({
        col: "users",
        data: { name: params.col },
        limit: 1,
      });

      if (profileData.length > 0) {
        profileType = "user";
      }
    }

    // If profile data is found, get analytics for this specific profile
    if (profileData && profileData.length > 0) {
      const profile = profileData[0];

      // Verify the current user has access to this analytics
      // Properly check if the user is the creator (and handle case when createdBy might be undefined)
      const isCreator =
        profile.createdBy?._id &&
        (typeof profile.createdBy._id === "string"
          ? profile.createdBy._id === mongoUser._id.toString()
          : profile.createdBy._id.toString() === mongoUser._id.toString());

      const isOwner =
        profileType === "user" &&
        profile._id.toString() === mongoUser._id.toString();

      const canViewAnalytics = isAdmin || isCreator || isOwner;

      if (!canViewAnalytics) {
        return (
          <div className={`p-8 text-center`}>
            <h1 className="text-2xl font-bold text-destructive mb-4">
              Access Denied
            </h1>
            <p>You don't have permission to view analytics for this profile.</p>
            <p className="mt-4 text-sm text-muted-foreground">
              This profile belongs to another user or you are not the creator of
              this{" "}
              {profileType === "landingpage"
                ? "landing page"
                : profileType === "directlink"
                ? "directlink"
                : "profile"}
              .
            </p>
          </div>
        );
      }

      // Check if access to analytics is allowed based on subscription and free trial period
      if (profileType === "directlink" || profileType === "landingpage") {
        // Check feature access using the common function
        const featureAccess = {
          hasAccess: true,
          reason: "",
          isFreeTrialPeriod: false,
          timeRemainingMs: 0,
          daysRemaining: 0,
        };

        // Skip access check for admins
        if (!isAdmin) {
          console.log(
            `Analytics - Checking access for ${profileType} with ID ${profile._id}`
          );

          // Check feature access using common function
          const accessCheck = await checkFreePlanFeaturesLimit({
            entityId: profile._id,
            entityType: profileType + "s", // Add 's' to make it the collection name (directlinks, landingpages)
            requiredPlan: "creator", // Analytics requires creator plan
            collectionName: profileType + "s",
          });

          console.log("Analytics - Access check result:", accessCheck);

          // Calculate days remaining if in free trial period
          let daysRemaining = 0;
          if (accessCheck.isFreeTrialPeriod && accessCheck.timeRemainingMs) {
            daysRemaining = Math.ceil(
              accessCheck.timeRemainingMs / (1000 * 60 * 60 * 24)
            );
          }

          // Update access status based on common function result
          Object.assign(featureAccess, {
            ...accessCheck,
            daysRemaining,
          });
        }

        // If no access, show the upgrade card
        if (
          !featureAccess.hasAccess &&
          landingpages.length > 0 &&
          directlinks.length > 0
        ) {
          return (
            <UpgradeMessageCard
              title="analyticsAccessRequired"
              message={featureAccess.reason || "analyticsRequiresSubscription"}
              requiredPlan="creator"
              contentDate={profile.createdAt}
              isFreeTrialPeriod={featureAccess.isFreeTrialPeriod}
              daysRemaining={featureAccess.daysRemaining}
              featureName="analytics"
            />
          );
        }
      }

      // Get visitors for this specific profile
      const visitors = await getAll({
        col: visitorCollection,
        data: {
          profileId: profile._id,
          profileType,
        },
        sort: { createdAt: -1 },
        limit: 1000,
      });

      // Get user-friendly profile type name for display
      const profileTypeName =
        profileType === "directlink"
          ? "Link"
          : profileType === "landingpage"
          ? "Landing Page"
          : "Profile";

      return (
        <div
          className={`mxa container p-4 ${
            SITE1 ? "max-w-[1000px]" : "mx-auto"
          }`}
        >
          <AnalyticsPageHeader
            profileTypeName={profileTypeName}
            profileName={profile.name}
            visitorsCount={visitors.length}
          />

          {/* Unified Stats Dashboard */}
          <UnifiedStatsDashboard
            visitors={visitors}
            profileId={profile.createdBy?._id || profile._id}
            landingPageId={profileType === "landingpage" ? profile._id : null}
            profileType={profileType}
          />

          {/* Social/Other Links Analytics - Only for non-directlink profiles */}
          {profileType !== "directlink" && (
            <div className="mb-8">
              <SocialLinksAnalytics
                profileId={profile.createdBy?._id || profile._id}
                landingPageId={
                  profileType === "landingpage" ? profile._id : null
                }
              />
            </div>
          )}

          {/* Full-width Visitor Timeline */}
          <div className="mb-8">
            <VisitorTimeline
              visitors={visitors}
              profileId={profile.createdBy?._id || profile._id}
              landingPageId={profileType === "landingpage" ? profile._id : null}
              hideClicks={profileType === "directlink"}
            />
          </div>

          {/* Three columns for other analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <div className="backdrop-blur-sm bg-accent/70 dark:bg-accent/40 border border-accent/30 p-4 rounded-lg shadow">
              <GeoDistribution visitors={visitors} />
            </div>

            <div className="backdrop-blur-sm bg-accent/70 dark:bg-accent/40 border border-accent/30 p-4 rounded-lg shadow">
              <DeviceAnalytics visitors={visitors} />
            </div>

            <div className="backdrop-blur-sm bg-accent/70 dark:bg-accent/40 border border-accent/30 p-4 rounded-lg shadow">
              <ReferrerAnalytics visitors={visitors} />
            </div>
          </div>

          <div className="mt-8">
            <AdvancedVisitorInsights
              visitors={visitors}
              isDev={mongoUser.isDev}
            />
          </div>
        </div>
      );
    }
  }

  // If we get here, either the collection is not found or it's a system collection
  // Let's show an overview of all profiles the user has access to

  // Get all profiles created by or owned by this user
  userProfiles = await getAll({
    col: "users",
    data: { _id: mongoUser._id },
  });

  // Get all directlinks and landing pages created by this user (on SITE2)
  if (SITE2) {
    directlinks = await getAll({
      col: "directlinks",
      data: { createdBy: mongoUser._id },
    });

    landingpages = await getAll({
      col: "landingpages",
      data: { createdBy: mongoUser._id },
    });
  }

  return (
    <div className={`container p-4 ${SITE1 ? "max-w-[1000px]" : "mx-auto"}`}>
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Select a profile, landing page, or link to view detailed analytics
        </p>
      </header>

      {/* // TODO !!!!!!! make new sep comp for "View Analytics →" */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {userProfiles.length > 0 && (
          <div className="bg-background p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Your Profiles</h2>
            <ul className="divide-y">
              {userProfiles.map((profile) => (
                <li key={profile._id} className="py-3">
                  <a
                    href={`/${profile.name}/analytics`}
                    className="flex items-center justify-between hover:bg-muted p-2 rounded"
                  >
                    <div>
                      <span className="font-medium">@{profile.name}</span>
                      <p className="text-sm text-muted-foreground">
                        User Profile
                      </p>
                    </div>
                    <span className="text-primary">View Analytics →</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {SITE2 && directlinks.length > 0 && (
          <div className="bg-background p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Your Direct Links</h2>
            <ul className="divide-y">
              {directlinks.map((link) => (
                <li key={link._id} className="py-3">
                  <a
                    href={`/${link.name}/analytics`}
                    className="flex items-center justify-between hover:bg-muted p-2 rounded"
                  >
                    <div>
                      <span className="font-medium">@{link.name}</span>
                      <p className="text-sm text-muted-foreground">
                        {link.active ? "Active" : "Inactive"} Direct Link
                      </p>
                    </div>
                    <span className="text-primary">View Analytics →</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {SITE2 && landingpages.length > 0 && (
          <div className="bg-background p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Your Landing Pages</h2>
            <ul className="divide-y">
              {landingpages.map((page) => (
                <li key={page._id} className="py-3">
                  <a
                    href={`/${page.name}/analytics`}
                    className="flex items-center justify-between hover:bg-muted p-2 rounded"
                  >
                    <div>
                      <span className="font-medium">@{page.name}</span>
                      <p className="text-sm text-muted-foreground">
                        {page.active ? "Active" : "Inactive"} Landing Page
                      </p>
                    </div>
                    <span className="text-primary">View Analytics →</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
