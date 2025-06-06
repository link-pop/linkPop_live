"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "@/components/Context/TranslationContext";
import { CheckCircle, Package, ArrowRight, Store } from "lucide-react";
import Link from "next/link";
import PostsLoader from "@/components/Post/Posts/PostsLoader";
import { getAll } from "@/lib/actions/crud";
import { useCartOperations } from "@/lib/hooks/useCartOperations";

export default function CartSuccessClient({ mongoUser }) {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { clearCartAndRefresh } = useCartOperations(mongoUser);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!sessionId || !mongoUser?._id) {
        setError("Missing session information");
        setIsLoading(false);
        return;
      }

      try {
        // Find ALL orders by Stripe session ID (multiple orders for different store owners)
        const fetchedOrders = await getAll({
          col: "storeitemsorders",
          data: {
            stripeSessionId: sessionId,
            createdBy: mongoUser._id,
          },
          populate: "items.storeItemId storeOwner",
          sort: { createdAt: -1 },
        });

        if (fetchedOrders && fetchedOrders.length > 0) {
          setOrders(fetchedOrders);

          // Clear cart and refresh cache after successful order
          try {
            const result = await clearCartAndRefresh();
            if (!result.success) {
              console.warn("Cart clearing issue:", result.error);
            }
          } catch (cartError) {
            console.error("Error clearing cart:", cartError);
            // Don't fail the order display if cart clearing fails
          }
        } else {
          setError("Orders not found");
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load order details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [sessionId, mongoUser?._id, clearCartAndRefresh]);

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

  if (error || !orders.length) {
    return (
      <div className="fcc min-h-screen p20">
        <div className="text-center">
          <p className="text-destructive">{error || "Orders not found"}</p>
          <Link
            href="/cart"
            className="mt15 px20 py10 bg-accent hover:bg-accent/80 text-accent-foreground rounded-lg transition-colors inline-block"
          >
            {t("backToCart")}
          </Link>
        </div>
      </div>
    );
  }

  const totalAmount = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="max-w-4xl mx-auto p20">
      {/* Success Header */}
      <div className="text-center mb30">
        <CheckCircle className="w60 h60 text-green-500 mx-auto mb15" />
        <h1 className="text-3xl font-bold mb10">{t("orderConfirmed")}</h1>
        <p className="text-muted-foreground">
          {t("thankYouForOrder")} - {orders.length}{" "}
          {orders.length === 1 ? t("order") : t("orders")} {t("created")}
        </p>
        <p className="text-lg font-semibold mt5">
          {t("total")}: ${totalAmount.toFixed(2)}
        </p>
      </div>

      {/* Multiple Orders */}
      <div className="fc g20 mb20">
        {orders.map((order, orderIndex) => (
          <div key={order._id} className="bg-background border rounded-lg p20">
            {/* Order Header */}
            <div className="f jcsb aic mb15 pb15 border-b">
              <div>
                <h2 className="text-xl font-semibold">
                  {t("order")} #{orderIndex + 1}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {order.orderNumber}
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">
                  ${order.total.toFixed(2)}
                </div>
                <div className="text-sm text-green-600 font-medium">
                  {order.paymentStatus}
                </div>
              </div>
            </div>

            {/* Store Owner Info */}
            <div className="f aic g10 mb15 p10 bg-muted/30 rounded-lg">
              <Store className="w16 h16 text-muted-foreground" />
              <div>
                <span className="text-sm text-muted-foreground">
                  {t("storeOwner")}:
                </span>
                <span className="ml5 font-medium">
                  {order.storeOwner?.username ||
                    order.storeOwner?.email ||
                    "Unknown Store Owner"}
                </span>
              </div>
            </div>

            {/* Order Details */}
            <div className="fc g10 mb15">
              <div className="f jcsb">
                <span className="text-muted-foreground">{t("orderDate")}:</span>
                <span className="font-medium">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div className="border-t pt15">
              <h3 className="font-semibold mb10">{t("items")}:</h3>
              <div className="fc g10">
                {order.items.map((item, index) => (
                  <div key={index} className="f jcsb aic">
                    <div className="f aic g10">
                      <Package className="w16 h16 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{item.title}</div>
                        {item.category && (
                          <div className="text-sm text-muted-foreground">
                            {item.category}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        ${item.priceAtTime.toFixed(2)} × {item.quantity}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ${(item.priceAtTime * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Subtotal */}
            <div className="border-t pt15 mt15">
              <div className="f jcsb aic">
                <span className="font-semibold">{t("orderTotal")}:</span>
                <span className="font-bold">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Next Steps */}
      <div className="bg-muted/50 border rounded-lg p20 mb20">
        <h3 className="font-semibold mb10">{t("whatHappensNext")}</h3>
        <div className="fc g8 text-sm text-muted-foreground">
          <div className="f aic g8">
            <ArrowRight className="w16 h16" />
            <span>{t("orderProcessingMessage")}</span>
          </div>
          <div className="f aic g8">
            <ArrowRight className="w16 h16" />
            <span>{t("shippingNotificationMessage")}</span>
          </div>
          <div className="f aic g8">
            <ArrowRight className="w16 h16" />
            <span>{t("trackingInfoMessage")}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="f g10">
        <Link
          href="/"
          className="flex-1 px20 py10 border border-border hover:bg-muted text-center rounded-lg transition-colors"
        >
          {t("continueShopping")}
        </Link>
        <Link
          href="/orders"
          className="flex-1 px20 py10 bg-accent hover:bg-accent/80 text-accent-foreground text-center rounded-lg transition-colors"
        >
          {t("viewOrders")}
        </Link>
      </div>
    </div>
  );
}
