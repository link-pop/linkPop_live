import { LOGIN_ROUTE } from "@/lib/utils/constants";
import { redirect } from "next/navigation";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import Posts from "@/components/Post/Posts/Posts";
import { SITE1, SITE2 } from "@/config/env";
import LandingPage from "@/components/Custom/LinkPop/LandingPage";
import { currentUser } from "@clerk/nextjs/server";

export default async function Home({ searchParams }) {
  // First check if the user is authenticated with Clerk
  const clerkUser = await currentUser();

  // If not authenticated at all, redirect to login
  if (!clerkUser) {
    redirect(LOGIN_ROUTE);
  }

  const { mongoUser, isAdmin } = await getMongoUser();

  // ! Base search params for NON-ADMIN users
  if (!isAdmin) {
    searchParams = {
      ...searchParams,
      active: true, // only show active posts for non-admin users
      userId: mongoUser?._id || "noUserId", // ! add userId to all search queries (eg: to find user liked posts)
    };
  }

  return (
    <>
      {SITE1 && (
        <Posts
          {...{
            searchParams,
            col: {
              name: "feeds",
              // ! used NOT is posts route so need manual settings
              settings: { hasLikes: true, hasComments: true, noFullPost: true },
            },
          }}
        />
      )}
      {SITE2 && <LandingPage mongoUser={mongoUser} />}
    </>
  );
}
