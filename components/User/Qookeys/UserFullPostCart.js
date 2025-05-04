"use client";

import { useCart } from "@/components/Cart/CartContext";
import CartItems from "@/components/Cart/CartItems";
import { formatPrice } from "@/lib/utils/formatPrice";
import StripeButton from "../../Stripe/StripeButton";
import PostsLoader from "../../Post/Posts/PostsLoader";
import CartEmptyCTA from "../../Cart/CartEmptyCTA";

export default function UserFullPostCart({
  isAdmin = false,
  mongoUser,
  post,
  className = "",
}) {
  const { getCartTotal, isInitialized } = useCart(post);

  // * cart loading
  if (!isInitialized) {
    return (
      <div className={`${className}`}>
        <div className="title mxa">Cart:</div>
        <PostsLoader isLoading />
      </div>
    );
  }

  const total = getCartTotal();
  const userOwnCart = mongoUser?._id === post?._id;

  return (
    <div className={`${className}`}>
      <div className="wf title mxa mb15">Cart:</div>
      {total === 0 ? (
        <>
          {userOwnCart ? (
            <CartEmptyCTA className="mt150" />
          ) : (
            <div className="mt155 fz14 tracking-[1px] gray wf tac">
              This user's cart is empty
            </div>
          )}
        </>
      ) : (
        <>
          <CartItems {...{ userOwnCart }} />
          <div className="my15 wf flex justify-between">
            <span className="font-medium">Total</span>
            <span className="font-medium">{formatPrice(total)}</span>
          </div>
          <div className="wf">
            {/* user's cart? => render checkout button */}
            {userOwnCart && (
              <StripeButton
                col={{ name: "products" }}
                className="wf bg-[var(--color-brand)]"
              >
                Checkout
              </StripeButton>
            )}
          </div>
        </>
      )}
    </div>
  );
}
