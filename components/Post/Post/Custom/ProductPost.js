import Post from "../Post";
import Tags from "../Tags";
import AddToCartButton from "@/components/Cart/AddToCartButton";
import ProductPostDiscountedPrice from "./ProductPostDiscountedPrice";
import StarRating from "@/components/ui/shared/StarRating/StarRating";

export default function ProductPost(props) {
  const { post, isAdmin, col, postsPaginationType, useCard = true } = props;

  return (
    <Post
      {...{
        post,
        ...props,
        className: "!p0 !pt5 maw320 wf hover:shadow-lg br10",
        showTags: true,
        tagsClassName: "a t0 l6 ttu border-[0px] border-[var(--color-brand)]",
        showAutoGenMongoFields: false,
        useCard: false,
        showCreatedBy: false,
        showCreatedAt: false,
        showCreatedAtTimeAgo: false,
      }}
      top4={
        <div className="miw300 fc hf">
          <div className="flex-1 fc aic">
            <div
              title={post?.title}
              className="px25 tac tracking-[1px] black fw500 fz20 line-clamp-1 mb8"
            >
              {post?.title}
            </div>
            <div
              title={post?.subtitle}
              className="px25 tac fz13 gray line-clamp-2 mb8"
            >
              {post?.subtitle}
            </div>
            <ProductPostDiscountedPrice
              className="!brand fcc pb8 tac gray fz17"
              show="both"
              post={post}
            />
            <div title={!post?.rating ? "no rating" : `${post?.rating} / 5`}>
              <StarRating
                className={`mb15 ${!post?.rating ? "opacity-30" : ""}`}
                readonly
                size={4}
                rating={!post?.rating ? 5 : post?.rating}
              />
            </div>
          </div>
        </div>
      }
      top5={<AddToCartButton post={post} />}
    />
  );
}
