"use client";

import { useTranslation } from "@/components/Context/TranslationContext";
import { usePathname } from "next/navigation";
import Toggle from "@/components/ui/shared/Toggle/Toggle";
import CartPageClient from "./CartPageClient";
import OrdersClient from "@/components/Orders/OrdersClient";
import StoreEarningsPageClient from "@/components/Store/StoreEarningsPageClient";

export default function CartOrdersEarningsClient({ mongoUser }) {
  const { t } = useTranslation();
  const pathname = usePathname();

  // Determine initial tab based on current route
  const getInitialTab = () => {
    if (pathname?.includes("/orders")) return 1;
    if (pathname?.includes("/storeearnings")) return 2;
    return 0; // Default to cart
  };

  const labels = [
    { text: "cart", className: "" },
    { text: "orders", className: "" },
    { text: "storeEarnings", className: "" },
  ];

  const contents = [
    <CartPageClient key="cart" mongoUser={mongoUser} />,
    <OrdersClient key="orders" mongoUser={mongoUser} />,
    <StoreEarningsPageClient key="earnings" mongoUser={mongoUser} />,
  ];

  return (
    <div className="min-h-screen">
      <Toggle
        labels={labels}
        contents={contents}
        className="maw1000 wf mxa"
        labelsClassName="mb20"
        initialTab={getInitialTab()}
      />
    </div>
  );
}
