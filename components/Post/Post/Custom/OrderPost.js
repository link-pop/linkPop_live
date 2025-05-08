import Post from "../Post";
import ProductPost from "./ProductPost";
import { formatPrice } from "@/lib/utils/formatPrice";
import { slugify } from "@/lib/utils/slugify";
import TextShortener from "@/components/ui/shared/TextShortener/TextShortener";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import CreatedBy from "../CreatedBy";
import CreatedAtCustom from "../CreatedAtCustom";
import { useRouter } from "next/navigation";

export default function OrderPost(props) {
  const { post, isAdmin, col } = props;
  const { product } = post;
  const router = useRouter();

  // Calculate total order amount
  const orderTotal = post.items.reduce((total, item) => {
    const price = item.productId?.["discounted price"] || item.productId?.price;
    return total + price * item.quantity;
  }, 0);

  const fakeTableLookClassName =
    "border-gray-200 border-b-[1px] -mt20 -mb20 hover:bg-gray-100";
  const tableItemHover = "hover:underline";

  return (
    <Post
      {...{
        post: { ...post, _id: product?._id },
        ...props,
        showAdminIcons: false,
        showAutoGenMongoFields: false,
        showCreatedAt: false,
        showCreatedAtTimeAgo: false,
        showCreatedBy: false,
        className: "wf",
        useCard: false,
      }}
      top4={
        <>
          <div
            className={`${fakeTableLookClassName} pt10 f fwn max-w-[1200px] wf mxa br0 bg-white rounded-lg cp`}
            onClick={() => router.push(`/orders/${post._id}`)}
          >
            {/* ORDER ID */}
            <Link
              href={`/orders/${post._id}`}
              className={`wbba hidden sm:f jcc !w190 wf px5 fz13 asfs ${tableItemHover}`}
            >
              {post._id}
            </Link>

            {/* ORDER DATE */}
            <div className="hidden sm:fcc tac asfs !w150 wf px5 fz13">
              <CreatedAtCustom
                createdAt={post.createdAt}
                showDash={false}
                createdAtTimeAgoClassName="wf"
              />
            </div>

            {/* CUSTOMER */}
            <div className="f jcc !w150 wf px5 asfs">
              <Link
                href={`/${post.createdBy?._id}`}
                onClick={(e) => e.stopPropagation()} // ! let each item be clickable inside "table" (OrderPost)
                className={`fcc`}
              >
                <CreatedBy
                  createdBy={post.createdBy}
                  showName={true}
                  className="fcc"
                  nameClassName="fcc fz13"
                />
              </Link>
            </div>

            {/* ORDER TOTAL */}
            <div className="f jcc !w150 wf px5 pt8">
              <span className="font-medium">{formatPrice(orderTotal)}</span>
            </div>

            {/* ORDER STATUS */}
            <div className="hidden sm:f jcc !w150 wf px5">
              <span className="asfs px-2 py-1 bg-green-100 text-green-800 rounded">
                Paid
              </span>
            </div>

            {/* ORDER ITEMS */}
            <div className="fc w300 mxa">
              {post.items.map((item) => (
                <Link
                  href={`/products/${slugify(item.productId?.title)}`}
                  key={item._id}
                  onClick={(e) => e.stopPropagation()} // ! let each item be clickable inside "table" (OrderPost)
                  className={`fcc g15 border-b border-gray-100 pb-4 dark:border-gray-700 ${tableItemHover}`}
                >
                  {item.productId?.files?.[0]?.fileUrl && (
                    <img
                      src={item.productId?.files[0].fileUrl}
                      alt={item.productId?.title}
                      className="asfs w80 h80 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3
                      // miw100 fixes: img-to-title on mobile was from left OR from top
                      className="miw100 font-medium"
                    >
                      {item.productId?.title}
                    </h3>

                    {/* Subtotal */}
                    <div className="font-medium text-sm">
                      {item.quantity > 1 &&
                        formatPrice(
                          (item.productId?.["discounted price"] ||
                            item.productId?.price) * item.quantity
                        )}
                    </div>

                    {/* Price */}
                    <div className="text-sm text-gray-500">
                      {formatPrice(
                        item.productId?.["discounted price"] ||
                          item.productId?.price
                      )}{" "}
                      {item.quantity > 1 && "each"}
                    </div>

                    <div className="text-sm text-gray-500 mt-2">
                      Quantity: {item.quantity}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      }
    />
  );
}
