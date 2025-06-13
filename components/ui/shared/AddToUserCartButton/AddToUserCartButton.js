"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Check, Minus, Plus } from "lucide-react";
import { useTranslation } from "@/components/Context/TranslationContext";
import { useContext } from "@/components/Context/Context";
import { isItemInUserCart } from "@/lib/actions/userCartActions";
import { useCartActionsWithContext } from "@/lib/hooks/useCartActionsWithContext";
import { formatPrice } from "@/lib/utils/formatPrice";
import StockIndicator from "@/components/ui/shared/StockIndicator/StockIndicator";

export default function AddToUserCartButton({
  storeItem,
  mongoUser,
  className = "",
  showPrice = true,
  variant = "default", // "default", "compact", "icon-only"
  showQuantitySelector = true,
  showStockIndicator = true,
}) {
  const { t } = useTranslation();
  const { toastSet } = useContext();
  const { addToUserCart, removeFromUserCart, updateCartItemQuantity } =
    useCartActionsWithContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [cartItemQuantity, setCartItemQuantity] = useState(0);

  // Check if user is logged in
  if (!mongoUser?._id) {
    return null;
  }

  // Check stock availability
  const isOutOfStock = !storeItem?.stock || storeItem.stock <= 0;
  const maxQuantity = storeItem?.stock || 0;

  // Check if item is already in cart on component mount
  useEffect(() => {
    const checkCartStatus = async () => {
      try {
        const itemInCart = await isItemInUserCart({
          storeItemId: storeItem._id,
        });
        setIsInCart(itemInCart);

        // If item is in cart, we could fetch the quantity here
        // For now, we'll set it to 1 as a default
        if (itemInCart) {
          setCartItemQuantity(1);
        }
      } catch (error) {
        console.error("Error checking cart status:", error);
      }
    };

    if (mongoUser?._id && storeItem?._id) {
      checkCartStatus();
    }
  }, [mongoUser?._id, storeItem?._id]);

  // Ensure quantity doesn't exceed stock
  useEffect(() => {
    if (quantity > maxQuantity && maxQuantity > 0) {
      setQuantity(maxQuantity);
    }
  }, [quantity, maxQuantity]);

  const handleAddToCart = async () => {
    if (isLoading || isOutOfStock) return;

    setIsLoading(true);

    try {
      const result = await addToUserCart({
        storeItemId: storeItem._id,
        quantity: quantity,
      });

      if (result?.error) {
        if (result.error.includes("already in cart")) {
          toastSet({
            isOpen: true,
            title: t("itemAlreadyInCart"),
          });
          setIsInCart(true);
          return;
        }
        if (result.error.includes("out of stock")) {
          toastSet({
            isOpen: true,
            title: t("itemOutOfStock"),
          });
          return;
        }
        if (result.error.includes("Only")) {
          toastSet({
            isOpen: true,
            title: t("insufficientStock"),
            text: result.error,
          });
          return;
        }
        throw new Error(result.error);
      }

      setIsInCart(true);
      setCartItemQuantity(quantity);
      toastSet({
        isOpen: true,
        title: t("addedToCart"),
      });
    } catch (error) {
      console.error("❌ Add to cart error:", error);
      toastSet({
        isOpen: true,
        title: t("errorAddingToCart"),
        text: error.message || "An error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateQuantity = async (newQuantity) => {
    if (isLoading || newQuantity < 1 || newQuantity > maxQuantity) return;

    setIsLoading(true);

    try {
      const result = await updateCartItemQuantity({
        storeItemId: storeItem._id,
        quantity: newQuantity,
      });

      if (result?.error) {
        if (result.error.includes("out of stock")) {
          toastSet({
            isOpen: true,
            title: t("itemOutOfStock"),
          });
          return;
        }
        if (result.error.includes("Only")) {
          toastSet({
            isOpen: true,
            title: t("insufficientStock"),
            text: result.error,
          });
          return;
        }
        throw new Error(result.error);
      }

      setCartItemQuantity(newQuantity);
      toastSet({
        isOpen: true,
        title: t("cartUpdated"),
      });
    } catch (error) {
      console.error("❌ Update quantity error:", error);
      toastSet({
        isOpen: true,
        title: t("errorAddingToCart"),
        text: error.message || "An error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromCart = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const result = await removeFromUserCart({
        storeItemId: storeItem._id,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      setIsInCart(false);
      setCartItemQuantity(0);
      toastSet({
        isOpen: true,
        title: t("removedFromCart"),
      });
    } catch (error) {
      console.error("❌ Remove from cart error:", error);
      toastSet({
        isOpen: true,
        title: t("errorRemovingFromCart"),
        text: error.message || "An error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderQuantitySelector = () => {
    if (!showQuantitySelector || variant === "icon-only" || isOutOfStock)
      return null;

    return (
      <div className="f aic g5 border rounded-lg px8 py5 bg-transparent">
        <button
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          disabled={quantity <= 1}
          className="f aic jcc w20 h20 rounded hover:bg-muted/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Minus size={12} />
        </button>
        <span className="min-w-[30px] text-center text-sm font-medium">
          {quantity}
        </span>
        <button
          onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
          disabled={quantity >= maxQuantity}
          className="f aic jcc w20 h20 rounded hover:bg-muted/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={12} />
        </button>
      </div>
    );
  };

  const renderCartQuantityDisplay = () => {
    if (!isInCart || variant === "icon-only") return null;

    return (
      <div className="f aic g10">
        <div className="f aic g5 border rounded-lg px8 py5">
          <button
            onClick={() => handleUpdateQuantity(cartItemQuantity - 1)}
            disabled={cartItemQuantity <= 1 || isLoading}
            className="f aic jcc w20 h20 rounded hover:bg-muted/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Minus size={12} />
          </button>
          <span className="min-w-[30px] text-center text-sm font-medium">
            {cartItemQuantity}
          </span>
          <button
            onClick={() => handleUpdateQuantity(cartItemQuantity + 1)}
            disabled={isLoading || cartItemQuantity >= maxQuantity}
            className="f aic jcc w20 h20 rounded hover:bg-muted/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={12} />
          </button>
        </div>
        <button
          onClick={handleRemoveFromCart}
          disabled={isLoading}
          className="h33 px15 py4 bg-red-400 hover:bg-red-400/80 text-red-400-foreground rounded-lg text-sm font-medium transition-colors"
        >
          {t("removeFromCart")}
        </button>
      </div>
    );
  };

  const renderAddButton = () => {
    const baseClasses =
      "f aic jcc gap-2 transition-all duration-200 rounded-lg font-medium";
    const variantClasses = {
      default:
        "h33 px15 py4 bg-accent hover:bg-accent/80 text-accent-foreground",
      compact:
        "px10 py8 bg-accent hover:bg-accent/80 text-accent-foreground text-sm",
      "icon-only":
        "p10 bg-accent hover:bg-accent/80 text-accent-foreground rounded-full",
    };

    const isDisabled = isLoading || isOutOfStock;
    const buttonClasses = `${baseClasses} ${
      variantClasses[variant]
    } ${className} ${
      isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
    }`;

    const icon = <ShoppingCart size={variant === "icon-only" ? 16 : 18} />;
    const text = isOutOfStock ? t("outOfStock") : t("addToCart");

    return (
      <button
        onClick={handleAddToCart}
        disabled={isDisabled}
        className={buttonClasses}
        title={variant === "icon-only" ? text : undefined}
      >
        {icon}
        {variant !== "icon-only" && <span>{text}</span>}
      </button>
    );
  };

  const renderContent = () => {
    if (isInCart) {
      return renderCartQuantityDisplay();
    }

    return (
      <div className="fc g10">
        {showStockIndicator && (
          <StockIndicator stock={storeItem?.stock || 0} variant="compact" />
        )}
        <div className="f aic g10">
          {showQuantitySelector && renderQuantitySelector()}
          {renderAddButton()}
        </div>
      </div>
    );
  };

  const renderWithPrice = () => {
    if (!showPrice || !storeItem?.price) {
      return renderContent();
    }

    return (
      <div className="fc g10">
        <div className="text-lg font-bold">{formatPrice(storeItem.price)}</div>
        {renderContent()}
      </div>
    );
  };

  return showPrice ? renderWithPrice() : renderContent();
}
