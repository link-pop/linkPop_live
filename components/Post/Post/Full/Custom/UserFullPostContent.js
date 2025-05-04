"use client";

import Toggle from "@/components/ui/shared/Toggle/Toggle";
import PostsLoader from "@/components/Post/Posts/PostsLoader";
import UserFullPostUserPosts from "./UserFullPostUserPosts";
import UserFullPostUserMedia from "./UserFullPostUserMedia";
import useUserContentCounts from "@/hooks/useUserContentCounts";
import { useTranslation } from "@/components/Context/TranslationContext";

export default function UserFullPostContent({
  post,
  col,
  isAdmin,
  mongoUser,
  visitedMongoUser,
}) {
  const { data: counts = { posts: 0, media: 0 }, isLoading } =
    useUserContentCounts(visitedMongoUser?._id);
  const { t } = useTranslation();

  if (!visitedMongoUser) return null;

  const showMediaCount = visitedMongoUser?.showMediaCount !== false;

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
              className: `w-1/2 ttu tac`,
            },
            {
              text: `${showMediaCount ? counts.media : ""} ${t("mediaCount")}`,
              className: `w-1/2 ttu tac`,
            },
          ]}
          contents={[
            <UserFullPostUserPosts
              {...{ post, col, isAdmin, mongoUser, visitedMongoUser }}
            />,
            <UserFullPostUserMedia
              {...{ post, col, isAdmin, mongoUser, visitedMongoUser }}
            />,
          ]}
        />
      )}
    </>
  );
}
