import { formatPrice } from "@/lib/utils/formatPrice";
import { slugify } from "@/lib/utils/slugify";
import FullPost from "../FullPost";
import Link from "next/link";
import CreatedAtCustom from "../../CreatedAtCustom";
import OrderFullPostThank from "./OrderFullPostThank";

export default function OrderFullPost(props) {
  const { post, isAdmin, col, mongoUser } = props;
  const { items } = post;
  const ownOrder = String(post?.createdBy?._id) === mongoUser?._id;

  // Calculate total
  const total = items?.reduce((sum, item) => {
    const price =
      item.productId?.["discounted price"] || item.productId?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  return (
    <FullPost
      {...props}
      skipCustom={true}
      showAutoGenMongoFields={false}
      showAdminIcons={false}
      showCreatedAt={false}
      showCreatedAtTimeAgo={false}
      className="maw990 wf mxa"
      showCreatedBy={true}
      top3={
        <div className="maw990 wf mxa p-6 bg-white rounded-lg shadow dark:bg-gray-800">
          {/* Order Header */}
          <div className="fc sm:f aic sm:aifs mb-6 pb-4 border-b">
            <div>
              <h2 className="text-2xl font-semibold">Order Details</h2>
              <div className="f aic g5">
                <b className="text-gray-500">Order ID:</b>
                <span className="fz14 gray">{post._id}</span>
              </div>
              <div className="f aic g5">
                <b className="text-gray-500">Order Date:</b>
                <CreatedAtCustom createdAt={post.createdAt} />
              </div>
            </div>
            <div className="mt3 px-4 py-2 text-sm font-medium text-green-800 bg-green-100 rounded-full">
              Completed
            </div>
          </div>

          {/* // ! Thank you message */}
          {ownOrder && <OrderFullPostThank />}

          {/* Order Items */}
          <div className="space-y-4">
            {items?.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 border rounded-lg"
              >
                {/* Product Image */}
                {item.productId?.files?.[0]?.fileUrl && (
                  <Link
                    href={`/products/${slugify(item.productId?.title)}`}
                    className="asfs shrink-0"
                  >
                    <img
                      src={item.productId?.files[0].fileUrl}
                      alt={item.productId?.title}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  </Link>
                )}

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${slugify(item.productId?.title)}`}
                    className="text-lg font-medium hover:underline"
                  >
                    {item.productId?.title}
                  </Link>
                  <p className="text-gray-500 text-sm mt-1">
                    {item.productId?.subtitle}
                  </p>
                  <div className="mt-2 flex items-center gap-4">
                    <span className="text-sm">Quantity: {item.quantity}</span>
                    <span className="text-sm font-medium">
                      {formatPrice(
                        (item.productId?.["discounted price"] ||
                          item.productId?.price) * item.quantity
                      )}
                    </span>
                  </div>
                  {/* // ! qookeys specific: Add activation keys to each item */}
                  <div className="wf brand mt5">
                    <b>Activation Key:</b>&nbsp;
                    {ownOrder
                      ? item.activationKey
                      : "xxxx-xxxx-xxxx-xxxx-xxxx (visible to owner)"}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="pt20">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">Total</span>
              <span className="text-xl font-semibold">
                {formatPrice(total)}
              </span>
            </div>
          </div>
        </div>
      }
    />
  );
}
