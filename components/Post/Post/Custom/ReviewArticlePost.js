import Link from "next/link";
import Tags from "../Tags";
import { slugify } from "@/lib/utils/slugify";
import { getFirstImage } from "../../../../lib/utils/getFirstImage";

export default function ReviewArticlePost({ reviewedPost, post }) {
  if (post.postCol.name !== "articles") return;

  // First image from text - improved regex and handling
  const firstImage = getFirstImage({
    text: reviewedPost?.text,
    title: reviewedPost?.title || "Article image",
    className: "asfs w50 h50 object-cover rounded",
    onError: (e) => {
      e.target.style.display = "none";
    },
  });

  // TODO has dup
  // Article created date
  const articleCreatedAt = new Date(reviewedPost?.createdAt).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );

  return (
    reviewedPost && (
      <Link href={`/articles/${slugify(reviewedPost.title)}`}>
        <div
          onClick={(e) => e.stopPropagation()}
          className="block p10 bg-gray-100 rounded-lg mb8 hover:bg-gray-200"
        >
          <div className="f aic g8">
            {firstImage}
            <div className="flex-1">
              <div className="fw500">{reviewedPost.title}</div>
              <div className="f aic g10 text-sm text-gray-500">
                <Tags
                  onClick={(e) => e.stopPropagation()}
                  tags={reviewedPost.tags}
                  col={{ name: "articles" }}
                />
                <span className="text-[lightgrey]">|</span>
                <div>{articleCreatedAt}</div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    )
  );
}
