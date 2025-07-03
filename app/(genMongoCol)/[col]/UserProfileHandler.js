import ClientSideProfileTracker from "./ClientSideProfileTracker";
import FullPost from "@/components/Post/Post/Full/FullPost";
import ProfileNotFound from "@/components/ui/shared/ProfileNotFound/ProfileNotFound";
import SubscriptionExpiredMessage from "@/components/ui/shared/ProfileNotFound/SubscriptionExpiredMessage";
import { SITE1 } from "@/config/env";
import { checkDirectlinkLandingpageAccess } from "@/lib/actions/checkDirectlinkLandingpageAccess";

export default async function UserProfileHandler({
  visitedMongoUser,
  mongoUser,
  isAdmin,
  ipAddress,
  userAgent,
  referrer,
}) {
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
        safePageUrl={visitedMongoUser.safePageUrl || ""}
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
