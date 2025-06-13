"use client";

import { useState } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";
import { useContext } from "@/components/Context/Context";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { useCartActionsWithContext } from "@/lib/hooks/useCartActionsWithContext";
import { formatPrice } from "@/lib/utils/formatPrice";
import RichTextContent from "@/components/ui/shared/RichTextContent/RichTextContent";
import OrderItemImageDisplay from "@/components/ui/shared/SimpleImageDisplay/OrderItemImageDisplay";
import StockIndicator from "@/components/ui/shared/StockIndicator/StockIndicator";

export default function CartItemCard({
  cartItem,
  mongoUser,
  onQuantityUpdate,
  onRemove,
}) {
  const { t } = useTranslation();
  const { toastSet } = useContext();
  const { updateCartItemQuantity, removeFromUserCart } =
    useCartActionsWithContext();
  const [isUpdating, setIsUpdating] = useState(false);

  const storeItem = cartItem.storeItemId;

  if (!storeItem) {
    return null; // Skip if store item was deleted
  }

  const isOutOfStock = !storeItem.stock || storeItem.stock <= 0;
  const maxQuantity = storeItem.stock || 0;
  const quantityExceedsStock = cartItem.quantity > maxQuantity;

  const updateQuantity = async (newQuantity) => {
    if (newQuantity < 1 || isUpdating) return;

    // Check stock availability
    if (newQuantity > maxQuantity) {
      toastSet({
        isOpen: true,
        title: t("insufficientStock"),
        text: t("onlyXItemsAvailable").replace("{count}", maxQuantity),
      });
      return;
    }

    setIsUpdating(true);

    try {
      const result = await updateCartItemQuantity({
        storeItemId: storeItem._id,
        quantity: newQuantity,
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
      console.error("❌ Error updating quantity:", error);
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
      const result = await removeFromUserCart({
        storeItemId: storeItem._id,
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
      console.error("❌ Error removing from cart:", error);
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
      className={`bg-background border border-border hover:border-accent/50 rounded-xl p15 transition-all duration-200 ${
        isOutOfStock || quantityExceedsStock
          ? "border-destructive/50 bg-destructive/5"
          : ""
      }`}
    >
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

              {/* Stock Indicator */}
              <div className="mt5">
                <StockIndicator
                  stock={storeItem.stock || 0}
                  variant="compact"
                />
              </div>

              {/* Stock Warning */}
              {quantityExceedsStock && (
                <div className="mt5 p8 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-xs text-destructive font-medium">
                    {t("onlyXItemsAvailable").replace("{count}", maxQuantity)}
                  </p>
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
          <div className="fc g10 lg:items-end">
            {/* Price */}
            <div className="text-right">
              <div className="text-lg font-bold text-foreground">
                {formatPrice(storeItem.price)}
              </div>
              <div className="text-sm text-muted-foreground">{t("each")}</div>
            </div>

            {/* Quantity Controls */}
            <div className="f aic g10">
              <div className="f aic g5 border rounded-lg px8 py5 bg-background">
                <button
                  onClick={() => updateQuantity(cartItem.quantity - 1)}
                  disabled={
                    cartItem.quantity <= 1 || isUpdating || isOutOfStock
                  }
                  className="f aic jcc w20 h20 rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus size={12} />
                </button>
                <span className="min-w-[40px] text-center text-sm font-medium">
                  {cartItem.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(cartItem.quantity + 1)}
                  disabled={
                    isUpdating ||
                    isOutOfStock ||
                    cartItem.quantity >= maxQuantity
                  }
                  className="f aic jcc w20 h20 rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={12} />
                </button>
              </div>

              {/* Remove Button */}
              <button
                onClick={removeFromCart}
                disabled={isUpdating}
                className="f aic jcc w30 h30 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={t("removeFromCart")}
              >
                <Trash2 size={14} />
              </button>
            </div>

            {/* Total Price */}
            <div className="text-right">
              <div className="text-lg font-bold text-foreground">
                {formatPrice(storeItem.price * cartItem.quantity)}
              </div>
              <div className="text-xs text-muted-foreground">{t("total")}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
