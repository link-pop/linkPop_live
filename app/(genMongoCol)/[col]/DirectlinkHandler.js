import ClientSideProfileTracker from "./ClientSideProfileTracker";
import DirectlinkFullPost from "@/components/Post/Post/Full/Custom/DirectlinkFullPost";
import ProfileNotFound from "@/components/ui/shared/ProfileNotFound/ProfileNotFound";
import SubscriptionExpiredMessage from "@/components/ui/shared/ProfileNotFound/SubscriptionExpiredMessage";
import { SITE1 } from "@/config/env";
import { checkDirectlinkLandingpageAccess } from "@/lib/actions/checkDirectlinkLandingpageAccess";

export default async function DirectlinkHandler({
  directlink,
  mongoUser,
  isAdmin,
  ipAddress,
  userAgent,
  referrer,
}) {
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
    destinationWithOrigin += "&FU=" + encodeURIComponent(directlink.freeUrl);
  }

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
          collectionName: SITE1 ? "s1profilevisitors" : "s2profilevisitors",
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
