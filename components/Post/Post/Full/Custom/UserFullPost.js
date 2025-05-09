import FullPost from "../FullPost";
import UserFullPostHeader from "./UserFullPostHeader";
import UserFullPostContent from "./UserFullPostContent";
import ProfileImages from "@/app/my/settings/profile/ProfileImages";
import UserFullPostInfo from "./UserFullPostInfo";
import UserFullPostUserNotAvailable from "./UserFullPostUserNotAvailable";
import UserFullPostFansCount from "./UserFullPostFansCount";
import UserFullPostSocials from "./UserFullPostSocials";

export default function UserFullPost({
  post,
  col,
  isAdmin,
  mongoUser,
  visitedMongoUser,
}) {
  if (!post) return null;

  // * Only show profile if user is available
  if (!visitedMongoUser?.isAvailable && !visitedMongoUser?.isOwner) {
    return <UserFullPostUserNotAvailable {...{ visitedMongoUser }} />;
  }

  return (
    <>
      <FullPost
        {...{
          post,
          col,
          isAdmin,
          mongoUser,
        }}
        showAutoGenMongoFields={false}
        skipCustom={true} // ! Set to true to prevent infinite recursion
        showFiles={false}
        showCreatedAt={false}
        showCreatedAtTimeAgo={false}
        showTags={true}
        className="!maw600 mxa"
        top={<ProfileImages {...{ mongoUser, visitedMongoUser }} />}
        top2={<UserFullPostHeader {...{ post, mongoUser, visitedMongoUser }} />}
        top3={<UserFullPostInfo {...{ mongoUser, visitedMongoUser }} />}
        top4={<UserFullPostFansCount {...{ post }} />}
        top5={
          <UserFullPostSocials
            {...{ post, col, mongoUser, visitedMongoUser }}
          />
        }
        top6={
          <UserFullPostContent
            {...{ post, col, isAdmin, mongoUser, visitedMongoUser }}
          />
        }
      />
    </>
  );
}
