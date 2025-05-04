import FeedPost from "../../Custom/FeedPost";

// TODO !!! text above img NOT below
export default function FeedFullPost({ post, col, isAdmin, mongoUser }) {
  return (
    <FeedPost
      {...{
        post,
        col,
        isAdmin,
        mongoUser,
      }}
      defaultShowComments={true}
      showAutoGenMongoFields={false}
      skipCustom={true} // ! Set to true to prevent infinite recursion
      showCreatedAt={false}
      showCreatedAtTimeAgo={false}
      showTags={true}
      //   showIcons={false}
      iconsClassName="f fwn"
      adminIconsClassName="poa r0 -t25"
    />
  );
}
