"use client";

import { useState, useEffect } from "react";
import { getUserCartCount } from "@/lib/actions/userCartActions";
import { BRAND_INVERT_CLASS } from "@/lib/utils/constants";

export default function CartIndicator({ className = "" }) {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const count = await getUserCartCount();
        setCartCount(count);
      } catch (error) {
        console.error("Error fetching cart count:", error);
        setCartCount(0);
      }
    };

    fetchCartCount();

    // Optional: Set up polling to refresh cart count periodically
    const interval = setInterval(fetchCartCount, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

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
