"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/components/Context/TranslationContext";
import { getAll } from "@/lib/actions/crud";
import PostsLoader from "@/components/Post/Posts/PostsLoader";
import OrderCard from "./OrderCard";
import { Package, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function OrdersClient({ mongoUser }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const {
    data: orders = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["userOrders", mongoUser?._id],
    queryFn: async () => {
      if (!mongoUser?._id) return [];

      try {
        const orders = await getAll({
          col: "storeitemsorders",
          data: {
            createdBy: mongoUser._id,
          },
          populate: "items.storeItemId",
          sort: { createdAt: -1 },
        });

        return orders || [];
      } catch (error) {
        console.error("Error fetching orders:", error);
        return [];
      }
    },
    enabled: Boolean(mongoUser?._id),
  });

  // Refresh orders when page becomes visible (e.g., returning from payment)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && mongoUser?._id) {
        queryClient.invalidateQueries(["userOrders", mongoUser._id]);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [mongoUser?._id, queryClient]);

  if (!mongoUser?._id) {
    return (
      <div className="fcc min-h-screen p20">
        <div className="text-center">
          <Package className="w40 h40 text-muted-foreground mx-auto mb10" />
          <h2 className="text-xl font-semibold mb5">{t("orders")}</h2>
          <p className="text-muted-foreground">{t("pleaseLoginToSearch")}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="fcc min-h-screen">
        <PostsLoader isLoading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="fcc min-h-screen p20">
        <div className="text-center">
          <p className="text-destructive">{t("errorLoadingOrders")}</p>
        </div>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="fcc min-h-screen p20">
        <div className="text-center">
          <ShoppingBag className="w40 h40 text-muted-foreground mx-auto mb10" />
          <h2 className="text-xl font-semibold mb5">{t("orders")}</h2>
          <p className="text-muted-foreground mb15">{t("noOrdersYet")}</p>
          <Link
            href="/"
            className="px20 py10 bg-accent hover:bg-accent/80 text-accent-foreground rounded-lg transition-colors"
          >
            {t("startShopping")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p20">
      <div className="mb20">
        <h1 className="text-2xl font-bold mb5">{t("orders")}</h1>
        <p className="text-muted-foreground">
          {orders.length} {orders.length === 1 ? t("order") : t("orders")}
        </p>
      </div>

      <div className="fc g15">
        {orders.map((order) => (
          <OrderCard key={order._id} order={order} />
        ))}
      </div>
    </div>
  );
}
