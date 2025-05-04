import Link from "next/link";
import ProductPostDiscountedPrice from "./ProductPostDiscountedPrice";
import { slugify } from "@/lib/utils/slugify";

export default function ReviewProductPost({ reviewedPost, post }) {
  if (post.postCol.name !== "products") return;

  return (
    reviewedPost && (
      <Link
        href={`/products/${slugify(reviewedPost.title)}`}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="block p10 bg-gray-100 rounded-lg mb8 hover:bg-gray-200"
        >
          <div className="f aic g8">
            {reviewedPost.files?.[0] && (
              <img
                src={reviewedPost.files[0].fileUrl}
                alt={reviewedPost.title}
                className="asfs w50 h50 object-cover rounded"
              />
            )}
            <div className="flex-1">
              <div className="fw500">{reviewedPost.title}</div>
              {post.postCol.name === "products" && (
                <ProductPostDiscountedPrice
                  className="f g5 gray t_075"
                  post={reviewedPost}
                />
              )}
            </div>
          </div>
        </div>
      </Link>
    )
  );
}
