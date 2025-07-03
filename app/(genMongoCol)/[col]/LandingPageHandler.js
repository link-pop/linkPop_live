import ClientSideProfileTracker from "./ClientSideProfileTracker";
import FullPost from "@/components/Post/Post/Full/FullPost";
import ProfileNotFound from "@/components/ui/shared/ProfileNotFound/ProfileNotFound";
import SubscriptionExpiredMessage from "@/components/ui/shared/ProfileNotFound/SubscriptionExpiredMessage";
import { SITE1 } from "@/config/env";
import { checkDirectlinkLandingpageAccess } from "@/lib/actions/checkDirectlinkLandingpageAccess";
import HideLeftNav from "./HideLeftNav";

export default async function LandingPageHandler({
  landingPage,
  mongoUser,
  isAdmin,
  ipAddress,
  userAgent,
  referrer,
}) {
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
        safePageUrl={landingPage.safePageUrl || ""}
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
