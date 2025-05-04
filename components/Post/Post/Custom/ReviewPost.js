import Testimonial from "@/components/Custom/Qookeys/LandingPage/Testimonial/Testimonial";
import Post from "../Post";
import { usePathname } from "next/navigation";
import ReviewArticlePost from "./ReviewArticlePost";
import ReviewProductPost from "./ReviewProductPost";
import CreatedBy from "../CreatedBy";
import CreatedAt from "../CreatedAt";

export default function ReviewPost(props) {
  const { post, isAdmin, col } = props;
  const reviewedPost = post?.postId;
  const pathname = usePathname();

  if (!post) return null;

  const testimonialData = {
    quote: post.text,
    author: post.createdBy?.name || "John B",
    location: `${post.createdBy?.city || "New York"}, ${
      post.createdBy?.country || "USA"
    }`,
    rating: post.rating,
  };

  return (
    <Post
      {...{
        post,
        ...props,
        showAutoGenMongoFields: false,
        showCreatedAt: false,
        showCreatedAtTimeAgo: false,
        showCreatedBy: false,
        className: "maw760 mxa wf por",
        useCard: true,
      }}
      top5={
        <>
          <Testimonial
            {...testimonialData}
            className="border-none shadow-none"
            createdBy={
              <div className="f aic g5">
                <CreatedBy createdBy={post.createdBy} />
                -
                <CreatedAt
                  className="gray"
                  createdAt={post.createdAt}
                  showTime={false}
                />
              </div>
            }
          />
          {/* // * don't show "review for" 100 times for the same product/article */}
          {["reviews", "users"].includes(pathname.split("/")[1]) && (
            <div className="p15">
              <div className="ml5 text-sm text-gray-500">
                review for {post.postCol.name.replace(/s$/, "")}
              </div>
              <ReviewArticlePost {...{ reviewedPost, post }} />
              <ReviewProductPost {...{ reviewedPost, post }} />
            </div>
          )}
        </>
      }
    />
  );
}
