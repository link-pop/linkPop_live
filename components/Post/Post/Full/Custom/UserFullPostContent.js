"use client";

import Toggle from "@/components/ui/shared/Toggle/Toggle";
import PostsLoader from "@/components/Post/Posts/PostsLoader";
import UserFullPostUserPosts from "./UserFullPostUserPosts";
import UserFullPostUserMedia from "./UserFullPostUserMedia";
import UserFullPostUserStore from "./UserFullPostUserStore";
import useUserContentCounts from "@/hooks/useUserContentCounts";
import { useTranslation } from "@/components/Context/TranslationContext";

export default function UserFullPostContent({
  post,
  col,
  isAdmin,
  mongoUser,
  visitedMongoUser,
}) {
  // Determine if current user is the owner of the profile
  const isOwner = mongoUser?._id && mongoUser?._id === visitedMongoUser?._id;

  const { data: counts = { posts: 0, media: 0, store: 0 }, isLoading } =
    useUserContentCounts(visitedMongoUser?._id, isOwner);
  const { t } = useTranslation();

  if (!visitedMongoUser) return null;

  const showMediaCount = visitedMongoUser?.showMediaCount !== false;
  const showStoreCount = visitedMongoUser?.showStoreCount !== false;

  return (
    <>
      {isLoading ? (
        <PostsLoader isLoading />
      ) : (
        <Toggle
          labelsClassName={`f fwn px10`}
          labels={[
            {
              text: `${counts.posts} ${t("postsCount")}`,
              className: `w-1/3 ttu tac`,
            },
            {
              text: `${showMediaCount ? counts.media : ""} ${t("mediaCount")}`,
              className: `w-1/3 ttu tac`,
            },
            {
              text: `${showStoreCount ? counts.store : ""} ${t("storeCount")}`,
              className: `w-1/3 ttu tac`,
            },
          ]}
          contents={[
            <UserFullPostUserPosts
              {...{ post, col, isAdmin, mongoUser, visitedMongoUser }}
            />,
            <UserFullPostUserMedia
              {...{ post, col, isAdmin, mongoUser, visitedMongoUser }}
            />,
            <UserFullPostUserStore
              {...{ post, col, isAdmin, mongoUser, visitedMongoUser }}
            />,
          ]}
        />
      )}
    </>
  );
}
