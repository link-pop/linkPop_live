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
      : col?.name === "chatrooms"
      ? `mla !w-[400px] !maw-[400px] !mx0 ${
          searchParams?.chatId
            ? "max-[768px]:!hidden max-[768px]:!w-[0px]"
            : "max-[767px]:miwf"
        } LeftChatroomPart`
      : ""
  }`,
}) {
  if (!col) return;
  const { isAdmin, mongoUser } = await getMongoUser();
  if (!mongoUser) redirect(LOGIN_ROUTE);
  const limit = 8;
  let data = {};

  if (!isAdmin) {
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
          col.name === "chatrooms"
            ? "border-l maw1000 mxa aifs fwn scrollbar-hide"
            : "maw600 mxa"
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
