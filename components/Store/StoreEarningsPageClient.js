"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";
import { useStoreEarnings } from "@/lib/hooks/useStoreEarnings";
import { manualEarningsRefresh } from "@/lib/actions/manualEarningsRefresh";
import { formatPrice } from "@/lib/utils/formatPrice";
import PostsLoader from "@/components/Post/Posts/PostsLoader";
import {
  DollarSign,
  TrendingUp,
  Package,
  Calendar,
  RefreshCw,
  Store,
  CreditCard,
  Clock,
  AlertCircle,
  Truck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TitleWithBackButton from "@/components/ui/shared/PageHeading/TitleWithBackButton";
import Toggle from "@/components/ui/shared/Toggle/Toggle";

export default function StoreEarningsPageClient({ mongoUser }) {
  const { t } = useTranslation();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState(null);

  const {
    earningsData,
    isLoading,
    error,
    refreshEarnings,
    invalidateEarnings,
  } = useStoreEarnings(mongoUser);

  // Auto-refresh data when component mounts and becomes visible
  useEffect(() => {
    const handleAutoRefresh = async () => {
      if (mongoUser?._id) {
        console.log("🔄 Auto-refreshing store earnings on component mount");
        try {
          await refreshEarnings();
        } catch (error) {
          console.warn("Auto-refresh failed:", error);
        }
      }
    };

    // Auto-refresh on mount
    handleAutoRefresh();

    // Auto-refresh when page becomes visible (returning from another tab/page)
    const handleVisibilityChange = () => {
      if (!document.hidden && mongoUser?._id) {
        console.log("🔄 Auto-refreshing store earnings on visibility change");
        invalidateEarnings();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [mongoUser?._id, refreshEarnings, invalidateEarnings]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshError(null);

    try {
      const result = await manualEarningsRefresh();

      if (result.error) {
        setRefreshError(result.error);
      } else {
        await refreshEarnings();
      }
    } catch (error) {
      setRefreshError(error.message || "Failed to refresh earnings");
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!mongoUser?._id) {
    return (
      <div className="fcc min-h-screen p20">
        <div className="text-center">
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

  const hasEarnings = earningsData && earningsData.totalOrders > 0;
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const currentMonthData = earningsData?.monthlyEarnings?.find(
    (month) => month.month === currentMonth && month.year === currentYear
  );

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="mb-8">
        <div className="text-2xl font-bold">{t("storeEarnings")}</div>
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            {t("trackYourStorePerformance")}
          </p>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="default"
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            {isRefreshing ? "Refreshing..." : t("refresh")}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {(error || refreshError) && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-4 h-4" />
            <span className="font-medium">Error</span>
          </div>
          <p className="text-sm text-destructive/80 mt-2">
            {error || refreshError || t("errorLoadingStoreEarnings")}
          </p>
          <button
            onClick={handleRefresh}
            className="mt-2 text-sm text-destructive hover:underline"
          >
            Try refreshing manually
          </button>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
        {/* Shipping Required */}
        <Card className="backdrop-blur-sm bg-accent/70 dark:bg-accent/40 border border-accent/30 rounded-xl shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="w-8 h-8 rounded-full flex items-center justify-center">
                <Truck size={18} className="text-red-500" />
              </div>
              <span className="text-sm">{t("shippingRequired")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500 mb-1">
              {earningsData?.shippingRequiredCount || 0}{" "}
              {earningsData?.shippingRequiredCount === 1
                ? t("order").toLowerCase().replace("s", "")
                : t("orders").toLowerCase()}
            </div>
            <div className="text-xs text-muted-foreground">
              {earningsData?.processingOrdersCount || 0} {t("processingOrders")}
            </div>
          </CardContent>
        </Card>

        {/* Total Earnings */}
        <Card className="backdrop-blur-sm bg-accent/70 dark:bg-accent/40 border border-accent/30 rounded-xl shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="w-8 h-8 rounded-full flex items-center justify-center">
                <DollarSign size={18} className="text-green-500" />
              </div>
              <span className="text-sm">{t("totalEarnings")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500 mb-1">
              {formatPrice(earningsData?.totalEarnings || 0)}
            </div>
            <div className="text-xs text-muted-foreground">
              {earningsData?.totalOrders || 0} {t("totalOrders")}
            </div>
          </CardContent>
        </Card>

        {/* Pending Earnings */}
        <Card className="backdrop-blur-sm bg-accent/70 dark:bg-accent/40 border border-accent/30 rounded-xl shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="w-8 h-8 rounded-full flex items-center justify-center">
                <Clock size={18} className="text-orange-500" />
              </div>
              <span className="text-sm">{t("pendingEarnings")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500 mb-1">
              {formatPrice(earningsData?.pendingEarnings || 0)}
            </div>
            <div className="text-xs text-muted-foreground">
              {earningsData?.shippedOrdersCount || 0} {t("shippedOrders")}
            </div>
          </CardContent>
        </Card>

        {/* Transferred Earnings */}
        <Card className="backdrop-blur-sm bg-accent/70 dark:bg-accent/40 border border-accent/30 rounded-xl shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="w-8 h-8 rounded-full flex items-center justify-center">
                <CreditCard size={18} className="text-blue-500" />
              </div>
              <span className="text-sm">{t("transferredEarnings")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {formatPrice(earningsData?.transferredEarnings || 0)}
            </div>
          </CardContent>
        </Card>

        {/* Canceled Amount */}
        <Card className="backdrop-blur-sm bg-accent/70 dark:bg-accent/40 border border-accent/30 rounded-xl shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="w-8 h-8 rounded-full flex items-center justify-center">
                <AlertCircle size={18} className="text-red-500" />
              </div>
              <span className="text-sm">{t("canceledAmount")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500 mb-1">
              {formatPrice(earningsData?.canceledAmount || 0)}
            </div>
            <div className="text-xs text-muted-foreground">
              {earningsData?.canceledOrdersCount || 0} {t("canceledOrders")}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toggle for Performance Data */}
      {hasEarnings && (
        <Toggle
          labels={[
            { text: "monthlyPerformance", className: "" },
            { text: "additionalStats", className: "" },
          ]}
          contents={[
            <Card
              className="backdrop-blur-sm bg-accent/70 dark:bg-accent/40 border border-accent/30 rounded-xl shadow-md"
              key="monthly"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  {t("monthlyPerformance")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentMonthData ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-foreground">
                        {formatPrice(currentMonthData.earnings)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date().toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-foreground">
                        {currentMonthData.orders}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t("orders")}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-foreground">
                        {currentMonthData.itemsSold}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t("itemsSold")}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    {t("noOrdersThisMonth")}
                  </p>
                )}
              </CardContent>
            </Card>,

            <Card
              className="backdrop-blur-sm bg-accent/70 dark:bg-accent/40 border border-accent/30 rounded-xl shadow-md"
              key="additional"
            >
              <CardHeader>
                <CardTitle className="text-xl">
                  {t("additionalStats")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Items Sold */}
                  <div className="text-center p-4 bg-background/50 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Package className="w-5 h-5 text-muted-foreground" />
                      <h3 className="font-semibold">{t("itemsSold")}</h3>
                    </div>
                    <p className="text-3xl font-bold text-foreground mb-2">
                      {earningsData.totalItemsSold}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {(
                        earningsData.totalItemsSold / earningsData.totalOrders
                      ).toFixed(1)}{" "}
                      {t("averageItemsPerOrder")}
                    </p>
                  </div>

                  {/* Average Order Value */}
                  <div className="text-center p-4 bg-background/50 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <TrendingUp className="w-5 h-5 text-muted-foreground" />
                      <h3 className="font-semibold">
                        {t("averageOrderValue")}
                      </h3>
                    </div>
                    <p className="text-3xl font-bold text-foreground mb-2">
                      {formatPrice(
                        earningsData.totalEarnings / earningsData.totalOrders
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("across")} {earningsData.totalOrders} {t("orders")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>,
          ]}
          className="mb-8"
          labelsClassName="max-w-md"
        />
      )}

      {/* Empty State */}
      {!hasEarnings && !isLoading && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-5">
            <Store className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">{t("noEarningsYet")}</h3>
          <p className="text-muted-foreground mb-5">
            {t("startSellingToSeeEarnings")}
          </p>
          <Button
            onClick={handleRefresh}
            variant="default"
            className="px-5 py-2"
          >
            {t("checkForEarnings")}
          </Button>
        </div>
      )}
    </div>
  );
}
