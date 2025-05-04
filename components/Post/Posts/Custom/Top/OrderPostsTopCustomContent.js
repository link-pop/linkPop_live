"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ShoppingCart, Users, Package, DollarSign } from "lucide-react";

export default function OrderPostsTopCustomContent({ col, posts }) {
  if (col.name !== "orders") return null;

  const totalSum = posts.reduce((sum, post) => sum + post.total, 0);
  const totalOrders = posts.length;
  const uniqueCustomers = new Set(posts.map((order) => order?.createdBy?._id))
    .size;
  const totalItemsSold = posts.reduce(
    (sum, order) =>
      sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0
  );

  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  // ! sort
  const router = useRouter();
  const pathname = usePathname();

  const getSortIcon = (field) => {
    const currentSort = searchParams.get("sort");
    if (!currentSort || !currentSort.startsWith(field)) return "↕";
    return currentSort === `${field}:1` ? "↑" : "↓";
  };

  const handleSort = (field) => {
    const newSearchParams = new URLSearchParams(searchParams);
    const currentSort = searchParams.get("sort");

    // Toggle between ascending and descending
    if (currentSort === `${field}:1`) {
      newSearchParams.set("sort", `${field}:-1`);
    } else if (currentSort === `${field}:-1`) {
      newSearchParams.delete("sort");
    } else {
      newSearchParams.set("sort", `${field}:1`);
    }

    router.push(`${pathname}?${newSearchParams.toString()}`);
  };
  // ? sort

  const sortableClassName =
    "wf tac py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cp hover:bg-gray-100";
  const nonSortableClassName =
    "wf tac py-3 text-xs font-medium text-gray-500 uppercase tracking-wider";

  return (
    posts.length > 0 && (
      <div className="fcc wf g1 p1">
        <div className="fcc wf">
          <div className="fcc wfc fw500 mt10 mb5">
            <div className="f aic">
              <ShoppingCart className="ml25 w18 h18" /> Total Orders:{" "}
              <span className="brand ml5">{totalOrders}</span>
            </div>
            {!userId && (
              <div className="f aic">
                <Users className="ml25 w18 h18" /> Total Customers:{" "}
                <span className="brand ml5">{uniqueCustomers}</span>
              </div>
            )}
            <div className="f aic">
              <Package className="ml25 w18 h18" /> Total Items{" "}
              {!userId ? "Sold" : "Bought"}:{" "}
              <span className="brand ml5">{totalItemsSold}</span>
            </div>
            <div className="f aic">
              <DollarSign className="ml25 w18 h18" /> Total{" "}
              {!userId ? "Income" : "Spent"}:{" "}
              <span className="brand ml5">${totalSum.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* // * KINDA TABLE HEAD for order posts (underlying OrderPosts) */}
        <div className="f fwn max-w-[1200px] wf mxa bg-gray-50">
          <div
            className={`${nonSortableClassName} hidden sm:f jcc !w190 cursor-default`}
          >
            order id
          </div>
          <div
            className={`${sortableClassName} hidden sm:f jcc !w150 cursor-pointer`}
            onClick={() => handleSort("createdAt")}
          >
            order date {getSortIcon("createdAt")}
          </div>
          <div
            className={`${sortableClassName} f jcc !w150 cursor-pointer`}
            onClick={() => handleSort("userId")}
          >
            customer {getSortIcon("userId")}
          </div>
          <div
            className={`${sortableClassName} f jcc !w150 cursor-pointer`}
            onClick={() => handleSort("total")}
          >
            total {getSortIcon("total")}
          </div>
          <div className={`${nonSortableClassName} hidden sm:f jcc !w150`}>
            status
          </div>
          <div className={`${nonSortableClassName} f jcc !w300 mxa`}>items</div>
        </div>
      </div>
    )
  );
}
