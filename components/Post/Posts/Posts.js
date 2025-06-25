import { redirect } from "next/navigation";
import PostsSearch from "../Search/PostsSearch";
import PostsClientInfiniteScroll from "./PostsClientInfiniteScroll";
import PostsServerWithPagination from "./PostsServerWithPagination";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import { LOGIN_ROUTE } from "@/lib/utils/constants";
import { getAll } from "@/lib/actions/crud";
import { postsColSpecialHandling } from "./PostsColSpecialHandling";

export default async function Posts({
  searchParams = {},
  col,
  postsPaginationType = "infinite",
  isDefaultSearch = true,
  className = `👋 mxa fcc g0 my0 container aistr ${
    ["users", "analytics", "reviews", "faqs"].includes(col?.name)
      ? "!fc !aic"
      : col?.name === "products"
      ? "g20"
      : col?.name === "directlinks" || col?.name === "landingpages"
      ? "pt50 px15"
      : "g15"
  }`,
}) {
  if (!col) return;
  const { isAdmin, mongoUser } = await getMongoUser();
  if (!mongoUser) redirect(LOGIN_ROUTE);
  const limit = 8;
  let data = {};

  // Always apply special handling for notifications and other collections
  // Admin users also need filtering for their own notifications
  if (
    !isAdmin ||
    ["notifications", "chatrooms", "storeitems"].includes(col.name)
  ) {
    data = await postsColSpecialHandling(col, searchParams, data, mongoUser);
  }

  // test com 1
  // TODO !!!!!!! make sep new fn
  // * HANDLE DIRECTLINKS ACCESS
  if (["directlinks", "landingpages"].includes(col.name)) {
    searchParams = {
      createdBy: mongoUser._id.toString(),
    };
  }

  return (
    <>
      {/* // if new left-side PostsSearch needed => make it from scratch (client-side) don't reuse current PostsSearch !!! */}
      {/* <PostsSearch {...{ searchParams, col, isDefaultSearch }} /> */}
      <div
        className={`fcc wf oys ${
          col.name === "chatrooms" ? "h-full w-full" : "maw600 mxa"
        }`}
      >
        {postsPaginationType === "infinite" && (
          <PostsClientInfiniteScroll
            {...{
              data,
              searchParams,
              col,
              isAdmin,
              postsPaginationType,
              limit,
              mongoUser,
              className,
            }}
          />
        )}
        {postsPaginationType === "page" && (
          <PostsServerWithPagination
            {...{
              searchParams,
              col,
              isAdmin,
              postsPaginationType,
              limit,
              mongoUser,
              className,
            }}
          />
        )}
      </div>
    </>
  );
}
