"use client";

import { useState, useEffect } from "react";
import { getStoreOwnerOrderCount } from "@/lib/actions/getCartAndOrderCounts";
import { BRAND_INVERT_CLASS } from "@/lib/utils/constants";

export default function OrderIndicator({ className = "" }) {
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    const fetchOrderCount = async () => {
      try {
        const count = await getStoreOwnerOrderCount();
        setOrderCount(count);
      } catch (error) {
        console.error("Error fetching order count:", error);
        setOrderCount(0);
      }
    };

    fetchOrderCount();

    // Optional: Set up polling to refresh order count periodically
    const interval = setInterval(fetchOrderCount, 60000); // Refresh every 60 seconds

    return () => clearInterval(interval);
  }, []);

  // Don't show badge if no pending orders
  if (orderCount === 0) return null;

  return (
    <div
      className={`bg_brand poa t-3 r-3 bg-orange-500 text-white rf min-w-[18px] h-[18px] fc jcc aic text-xs font-bold ${className}`}
    >
      <span className={`${BRAND_INVERT_CLASS}`}>
        {orderCount > 99 ? "99+" : orderCount}
      </span>
    </div>
  );
}
