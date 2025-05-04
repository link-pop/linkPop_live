import Link from "next/link";
import Post from "../Post";
import CreatedBy from "../CreatedBy";

export default function UserPost(props) {
  const { post, isAdmin, col } = props;
  console.log({ post });

  return (
    <Post
      {...{
        post,
        ...props,
        showAutoGenMongoFields: false,
        className: "maw760 wf",
      }}
      top4={
        <div className="f aic g10">
          <CreatedBy createdBy={post} />
          <div className="gray">{post?.email}</div>
        </div>
      }
    />
  );
}
