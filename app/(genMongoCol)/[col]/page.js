import Posts from "@/components/Post/Posts/Posts";
import FullPost from "@/components/Post/Post/Full/FullPost";
import { getAllMongoCollectionsData } from "@/lib/utils/mongo/getAllMongoCollectionsData";
import { checkCollectionAccess } from "@/lib/utils/mongo/checkCollectionAccess";
import { getOne } from "@/lib/actions/crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import { SITE1, SITE2 } from "@/config/env";
import ClientSideProfileTracker from "./ClientSideProfileTracker";
import HideLeftNav from "./HideLeftNav";
import { getClientIP } from "@/lib/utils/visitor/getClientIP";
import { getVisitInfo } from "@/lib/utils/visitor/getVisitInfo";
import ProfileNotFound from "@/components/ui/shared/ProfileNotFound/ProfileNotFound";
import { checkDirectlinkLandingpageAccess } from "@/lib/actions/checkDirectlinkLandingpageAccess";
import DirectlinkFullPost from "@/components/Post/Post/Full/Custom/DirectlinkFullPost";
import SubscriptionExpiredMessage from "@/components/ui/shared/ProfileNotFound/SubscriptionExpiredMessage";

// posts for provided collection
export default async function postsPage({ searchParams, params }) {
  // Get all available system collections
  let availableSystemCols = await getAllMongoCollectionsData();
  availableSystemCols = availableSystemCols.map((col) => col.name);

  // Check if the requested collection is a system collection
  const isSystemCollection = availableSystemCols.includes(params.col);

  // If it's a system collection, handle it normally
  if (isSystemCollection) {
    const col = await getAllMongoCollectionsData(params.col);
    await checkCollectionAccess({ col, place: "allPosts" });
    return <Posts {...{ searchParams, col }} />;
  }
  // If it's not a system collection, treat it as a profile (user, directlink, or landing page)
  else {
    // Get the current user
    const { mongoUser, isAdmin } = await getMongoUser();
    const { userAgent, referrer } = getVisitInfo();
    const ipAddress = getClientIP();

    if (SITE2) {
      // For SITE2, first check directlinks collection
      const directlink = await getOne({
        col: "directlinks",
        data: { name: params.col, active: true },
      });

      if (directlink) {
        // Check if this directlink can be accessed
        const accessCheck = await checkDirectlinkLandingpageAccess({
          entity: directlink,
          entityType: "directlink",
          ipAddress,
          isAdmin,
        });

        if (!accessCheck.allowed) {
          // Check if subscription is expired and user is not geo-blocked
          if (
            (accessCheck.reason === "subscription_required" ||
              accessCheck.reason === "subscription_limit_exceeded" ||
              accessCheck.reason === "subscription_error") &&
            accessCheck.reason !== "geo_blocked"
          ) {
            return <SubscriptionExpiredMessage entityType="link" />;
          }
          return <ProfileNotFound />;
        }

        // Add tracking parameters to the destination URL
        let destinationWithOrigin = directlink.destinationUrl;
        const hasQueryParams = destinationWithOrigin.includes("?");

        // Add our tracking parameters
        destinationWithOrigin += hasQueryParams
          ? "&fromDirectlink=true&linkId=" + directlink._id
          : "?fromDirectlink=true&linkId=" + directlink._id;

        // If there's a free URL, also include it (encoded) with the shorter parameter name
        if (directlink.freeUrl) {
          destinationWithOrigin +=
            "&FU=" + encodeURIComponent(directlink.freeUrl);
        }

        // Use the ClientSideProfileTracker for tracking and redirection
        return (
          <>
            <ClientSideProfileTracker
              {...{
                visitorId: mongoUser?._id?.toString(),
                profileId: directlink._id.toString(),
                profileType: "directlink",
                ipAddress,
                userAgent,
                referrer,
                redirected: true,
                destinationUrl: destinationWithOrigin,
                collectionName: SITE1
                  ? "s1profilevisitors"
                  : "s2profilevisitors",
                redirectUrl: destinationWithOrigin,
                shieldProtection:
                  directlink.shieldProtection !== undefined
                    ? directlink.shieldProtection
                    : true,
                safePageUrl: directlink.safePageUrl || "https://www.google.com",
                createdBy: directlink.createdBy,
              }}
            />
            <DirectlinkFullPost post={directlink} />
          </>
        );
      }

      // ! Then check landing pages
      const landingPage = await getOne({
        col: "landingpages",
        data: { name: params.col, active: true },
      });

      if (landingPage) {
        // Check if this landing page can be accessed
        const accessCheck = await checkDirectlinkLandingpageAccess({
          entity: landingPage,
          entityType: "landingpage",
          ipAddress,
          isAdmin,
        });

        if (!accessCheck.allowed) {
          // Check if subscription is expired and user is not geo-blocked
          if (
            (accessCheck.reason === "subscription_required" ||
              accessCheck.reason === "subscription_limit_exceeded" ||
              accessCheck.reason === "subscription_error") &&
            accessCheck.reason !== "geo_blocked"
          ) {
            return <SubscriptionExpiredMessage entityType="landingpage" />;
          }
          return <ProfileNotFound />;
        }

        // Found a landing page with this name
        const col = { name: "landingpages" };

        return (
          <>
            <ClientSideProfileTracker
              visitorId={mongoUser?._id?.toString()}
              profileId={landingPage._id.toString()}
              profileType="landingpage"
              ipAddress={ipAddress}
              userAgent={userAgent}
              referrer={referrer}
              redirected={false}
              collectionName={SITE1 ? "s1profilevisitors" : "s2profilevisitors"}
              shieldProtection={
                landingPage.shieldProtection !== undefined
                  ? landingPage.shieldProtection
                  : true
              }
              safePageUrl={landingPage.safePageUrl || "https://www.google.com"}
              createdBy={landingPage.createdBy}
            />
            <FullPost
              {...{
                post: landingPage,
                col,
                isAdmin,
                mongoUser,
              }}
            />
            <HideLeftNav />
          </>
        );
      }
    }
    // ? Then check landing pages

    // For SITE1 or if no directlink/landingpage found in SITE2, look for a user
    const visitedMongoUser = await getOne({
      col: "users",
      data: { name: params.col },
    });

    if (visitedMongoUser) {
      // Check if this user can be accessed
      const accessCheck = await checkDirectlinkLandingpageAccess({
        entity: visitedMongoUser,
        entityType: "user",
        ipAddress,
        isAdmin,
      });

      if (!accessCheck.allowed) {
        // Check if subscription is expired and user is not geo-blocked
        if (
          (accessCheck.reason === "subscription_required" ||
            accessCheck.reason === "subscription_limit_exceeded" ||
            accessCheck.reason === "subscription_error") &&
          accessCheck.reason !== "geo_blocked"
        ) {
          return <SubscriptionExpiredMessage entityType="profile" />;
        }
        return <ProfileNotFound />;
      }

      // Found a user with this name
      const col = { name: "users" };

      return (
        <>
          <ClientSideProfileTracker
            visitorId={mongoUser?._id?.toString()}
            profileId={visitedMongoUser._id.toString()}
            profileType="user"
            ipAddress={ipAddress}
            userAgent={userAgent}
            referrer={referrer}
            redirected={false}
            collectionName={SITE1 ? "s1profilevisitors" : "s2profilevisitors"}
            shieldProtection={
              visitedMongoUser.shieldProtection !== undefined
                ? visitedMongoUser.shieldProtection
                : true
            }
            safePageUrl={
              visitedMongoUser.safePageUrl || "https://www.google.com"
            }
            createdBy={visitedMongoUser._id.toString()}
          />
          <FullPost
            {...{
              post: visitedMongoUser,
              col,
              isAdmin,
              mongoUser,
              visitedMongoUser,
            }}
          />
        </>
      );
    }

    // If nothing found, show 404
    return <ProfileNotFound />;
  }
}
