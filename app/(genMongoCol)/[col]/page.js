import Posts from "@/components/Post/Posts/Posts";
import { getAllMongoCollectionsData } from "@/lib/utils/mongo/getAllMongoCollectionsData";
import { checkCollectionAccess } from "@/lib/utils/mongo/checkCollectionAccess";
import { getOne } from "@/lib/actions/crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import { SITE2 } from "@/config/env";
import { getClientIP } from "@/lib/utils/visitor/getClientIP";
import { getVisitInfo } from "@/lib/utils/visitor/getVisitInfo";
import ProfileNotFound from "@/components/ui/shared/ProfileNotFound/ProfileNotFound";
import DirectlinkHandler from "./DirectlinkHandler";
import LandingPageHandler from "./LandingPageHandler";
import UserProfileHandler from "./UserProfileHandler";

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
        return (
          <DirectlinkHandler
            {...{
              directlink,
              mongoUser,
              isAdmin,
              ipAddress,
              userAgent,
              referrer,
            }}
          />
        );
      }

      // ! Then check landing pages
      const landingPage = await getOne({
        col: "landingpages",
        data: { name: params.col, active: true },
      });

      if (landingPage) {
        return (
          <LandingPageHandler
            {...{
              landingPage,
              mongoUser,
              isAdmin,
              ipAddress,
              userAgent,
              referrer,
            }}
          />
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
      return (
        <UserProfileHandler
          {...{
            visitedMongoUser,
            mongoUser,
            isAdmin,
            ipAddress,
            userAgent,
            referrer,
          }}
        />
      );
    }

    // If nothing found, show 404
    return <ProfileNotFound />;
  }
}
