"use client";

import { useState } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";
import { useContext } from "@/components/Context/Context";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { update, removeOne } from "@/lib/actions/crud";
import { formatPrice } from "@/lib/utils/formatPrice";
import RichTextContent from "@/components/ui/shared/RichTextContent/RichTextContent";
import OrderItemImageDisplay from "@/components/ui/shared/SimpleImageDisplay/OrderItemImageDisplay";

export default function CartItemCard({
  cartItem,
  mongoUser,
  onQuantityUpdate,
  onRemove,
}) {
  const { t } = useTranslation();
  const { toastSet } = useContext();
  const [isUpdating, setIsUpdating] = useState(false);

  const storeItem = cartItem.storeItemId;

  if (!storeItem) {
    return null; // Skip if store item was deleted
  }

  const updateQuantity = async (newQuantity) => {
    if (newQuantity < 1 || isUpdating) return;

    setIsUpdating(true);

    try {
      const result = await update({
        col: "usercarts",
        data: { _id: cartItem._id },
        update: { quantity: newQuantity },
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      onQuantityUpdate?.();

      toastSet({
        isOpen: true,
        title: t("cartUpdated"),
      });
    } catch (error) {
      console.error("Error updating quantity:", error);
      toastSet({
        isOpen: true,
        title: t("errorAddingToCart"),
        text: error.message || "An error occurred",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const removeFromCart = async () => {
    if (isUpdating) return;

    setIsUpdating(true);

    try {
      const result = await removeOne({
        col: "usercarts",
        data: { _id: cartItem._id },
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      onRemove?.();

      toastSet({
        isOpen: true,
        title: t("removedFromCart"),
      });
    } catch (error) {
      console.error("Error removing from cart:", error);
      toastSet({
        isOpen: true,
        title: t("errorRemovingFromCart"),
        text: error.message || "An error occurred",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      className={`group transition-all duration-200 hover:shadow-md ${
        isUpdating ? "opacity-60" : ""
      }`}
    >
      <div className="bg-background border border-border hover:border-accent/50 rounded-xl p15 transition-all duration-200">
        <div className="f g15">
          {/* Store Item Image */}
          <div className="flex-shrink-0">
            <OrderItemImageDisplay
              item={cartItem}
              size={80}
              alt={storeItem.title || "Store item"}
              fallbackIcon={ShoppingCart}
              fallbackIconSize={30}
              className="rounded-lg overflow-hidden shadow-sm"
            />
          </div>

          {/* Item Details and Controls Container */}
          <div className="flex-1 f flex-col lg:flex-row g15">
            {/* Left Side - Item Details */}
            <div className="flex-1 fc g8">
              <div>
                <h3 className="font-semibold text-base text-foreground line-clamp-1">
                  {storeItem.title || t("storeItem")}
                </h3>
                {storeItem.category && (
                  <div className="inline-block mt2">
                    <span className="px6 py1 bg-accent/20 text-accent-foreground text-xs font-medium rounded-full uppercase tracking-wide">
                      {storeItem.category}
                    </span>
                  </div>
                )}
                {storeItem.text && (
                  <div className="text-sm text-muted-foreground mt5 line-clamp-2">
                    <RichTextContent content={storeItem.text} />
                  </div>
                )}
              </div>
            </div>

            {/* Right Side - Price and Controls */}
            <div className="flex-shrink-0 f flex-col sm:flex-row lg:flex-col g10 lg:items-end">
              {/* Price Section */}
              <div className="fc g2 text-right">
                <div className="text-lg font-bold text-foreground">
                  {formatPrice(storeItem.price)}
                </div>
                <div className="text-xs text-muted-foreground">{t("each")}</div>
              </div>

              {/* Quantity Controls */}
              <div className="f aic g8">
                <div className="f aic g2 border border-border rounded-lg px6 py6 bg-background shadow-sm">
                  <button
                    onClick={() => updateQuantity(cartItem.quantity - 1)}
                    disabled={cartItem.quantity <= 1 || isUpdating}
                    className="f aic jcc w24 h24 rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title={t("decreaseQuantity")}
                  >
                    <Minus size={14} />
                  </button>
                  <div className="min-w-[40px] text-center font-semibold text-foreground text-sm">
                    {cartItem.quantity}
                  </div>
                  <button
                    onClick={() => updateQuantity(cartItem.quantity + 1)}
                    disabled={isUpdating}
                    className="f aic jcc w24 h24 rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title={t("increaseQuantity")}
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <button
                  onClick={removeFromCart}
                  disabled={isUpdating}
                  className="f aic jcc w32 h32 rounded-lg border border-destructive/30 hover:bg-destructive/10 hover:border-destructive/50 text-destructive disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  title={t("removeFromCart")}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Item Total */}
              <div className="f jcsb aic pt8 border-t border-border lg:border-t-0 lg:pt0">
                <span className="text-xs text-muted-foreground lg:hidden">
                  {cartItem.quantity} × {formatPrice(storeItem.price)}
                </span>
                <div className="text-base font-bold text-foreground">
                  {formatPrice(storeItem.price * cartItem.quantity)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
