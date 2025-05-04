import { formatPrice } from "@/lib/utils/formatPrice";

export default function ProductPostDiscountedPrice({
  post,
  className = "",
  show = "both",
}) {
  const discountedPrice = post?.["discounted price"];
  return show === "one" ? (
    <div className={`brand fz20 ${className}`}>
      {discountedPrice ? (
        <div>{formatPrice(discountedPrice)}</div>
      ) : (
        <div>{formatPrice(post?.price)}</div>
      )}
    </div>
  ) : (
    <div className={className}>
      <div className={`${discountedPrice ? "opacity-50 tdlt gray" : ""}`}>
        {formatPrice(post?.price)}
      </div>
      {discountedPrice && (
        <div className="brand fw500">{formatPrice(discountedPrice)}</div>
      )}
    </div>
  );
}
