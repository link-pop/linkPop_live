"use client";

import { useCart } from "@/components/Context/CartContext";
import { BRAND_INVERT_CLASS } from "@/lib/utils/constants";

export default function CartIndicator({ className = "" }) {
  const { cartCount } = useCart(); // cartCount = number of unique store items, not total quantity

  // Don't show badge if no items in cart
  if (cartCount === 0) return null;

  return (
    <div
      className={`bg_brand bg-blue-500 text-white rf min-w-[18px] h-[18px] fc jcc aic text-xs font-bold ${className}`}
    >
      <span className={`${BRAND_INVERT_CLASS}`}>
        {cartCount > 99 ? "99+" : cartCount}
      </span>
    </div>
  );
}
