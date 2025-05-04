import { timeToRead } from "@/lib/utils/timeToRead";
import FullPost from "../FullPost";
import ReviewsHub from "../../../../Review/ReviewsHub";
import { Clock8 } from "lucide-react";

export default function ArticleFullPost({ post, col, isAdmin, mongoUser }) {
  return (
    <article className="max-w-3xl mx-auto px-4">
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
        showCreatedAt={true}
        showCreatedAtTimeAgo={true}
        showTags={true}
        className=""
        top3={
          <div className="sm:px15 f aic g5 gray fz12">
            <Clock8 className="w20" />
            {timeToRead(post?.text)}
          </div>
        }
        top9={<ReviewsHub {...{ post, col, isAdmin }} />}
      />
    </article>
  );
}
