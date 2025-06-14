"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/components/Context/TranslationContext";
import {
  getUserOrders,
  getStoreOwnerOrders,
} from "@/lib/actions/userCartActions";
import PostsLoader from "@/components/Post/Posts/PostsLoader";
import OrderCard from "./OrderCard";
import OrderStatusFilter from "@/components/ui/shared/OrderStatusFilter/OrderStatusFilter";
import { Package, ShoppingBag, Store } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function OrdersClient({ mongoUser }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("buyer"); // "buyer" or "seller"
  const [selectedStatus, setSelectedStatus] = useState("all"); // Order status filter

  // Get user orders (as buyer)
  const {
    data: userOrders = [],
    isLoading: isLoadingUserOrders,
    error: userOrdersError,
  } = useQuery({
    queryKey: ["userOrders", mongoUser?._id],
    queryFn: async () => {
      if (!mongoUser?._id) return [];
      const result = await getUserOrders();
      return result.error ? [] : result;
    },
    enabled: Boolean(mongoUser?._id),
  });

  // Get store owner orders (as seller)
  const {
    data: storeOwnerOrders = [],
    isLoading: isLoadingStoreOwnerOrders,
    error: storeOwnerOrdersError,
  } = useQuery({
    queryKey: ["storeOwnerOrders", mongoUser?._id],
    queryFn: async () => {
      if (!mongoUser?._id) return [];
      const result = await getStoreOwnerOrders();
      return result.error ? [] : result;
    },
    enabled: Boolean(mongoUser?._id),
  });

  // Refresh orders when page becomes visible (e.g., returning from payment)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && mongoUser?._id) {
        queryClient.invalidateQueries(["userOrders", mongoUser._id]);
        queryClient.invalidateQueries(["storeOwnerOrders", mongoUser._id]);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [mongoUser?._id, queryClient]);

  // Reset status filter when switching tabs
  useEffect(() => {
    setSelectedStatus("all");
  }, [activeTab]);

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

  const isLoading = isLoadingUserOrders || isLoadingStoreOwnerOrders;
  const error = userOrdersError || storeOwnerOrdersError;

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

  const allCurrentOrders =
    activeTab === "buyer" ? userOrders : storeOwnerOrders;

  // Filter orders by selected status
  const filteredOrders =
    selectedStatus === "all"
      ? allCurrentOrders
      : allCurrentOrders.filter(
          (order) => order.orderStatus === selectedStatus
        );

  const hasUserOrders = userOrders.length > 0;
  const hasStoreOwnerOrders = storeOwnerOrders.length > 0;

  if (!hasUserOrders && !hasStoreOwnerOrders) {
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
        <h1 className="text-2xl font-bold mb5">
          {t("orders")}
          {activeTab === "seller" && (
            <span className="text-red-400 fz18">
              {" "}
              * {t("orderProcessingMessageShopOwner")}
            </span>
          )}
        </h1>

        {/* Tab Navigation */}
        <div className="fr g10 mb15">
          <button
            onClick={() => setActiveTab("buyer")}
            className={`px15 py8 rounded-lg transition-colors fr g5 ${
              activeTab === "buyer"
                ? "bg-accent brand border"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {t("myPurchases")} ({userOrders.length})
          </button>
          <button
            onClick={() => setActiveTab("seller")}
            className={`px15 py8 rounded-lg transition-colors fr g5 ${
              activeTab === "seller"
                ? "bg-accent brand border"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {t("mySales")} ({storeOwnerOrders.length})
          </button>
        </div>

        {/* Order Status Filter */}
        <div className="mb15">
          <OrderStatusFilter
            orders={allCurrentOrders}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            className="mb10"
          />
        </div>

        <p className="text-muted-foreground">
          {filteredOrders.length}{" "}
          {filteredOrders.length === 1 ? t("order") : t("orders")}
          {activeTab === "buyer" ? ` ${t("purchased")}` : ` ${t("sold")}`}
          {selectedStatus !== "all" &&
            ` • ${t("filtered")} ${t(selectedStatus)}`}
        </p>
      </div>

      <div className="fc g15">
        {filteredOrders.map((order, index) => (
          <OrderCard
            key={order._id}
            order={order}
            mongoUser={mongoUser}
            isStoreOwner={activeTab === "seller"}
            orderIndex={index}
          />
        ))}
      </div>
    </div>
  );
}
