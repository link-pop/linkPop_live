"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Check, Minus, Plus } from "lucide-react";
import { useTranslation } from "@/components/Context/TranslationContext";
import { useContext } from "@/components/Context/Context";
import { add, removeOne, getOne, update } from "@/lib/actions/crud";
import { formatPrice } from "@/lib/utils/formatPrice";

export default function AddToUserCartButton({
  storeItem,
  mongoUser,
  className = "",
  showPrice = true,
  variant = "default", // "default", "compact", "icon-only"
  showQuantitySelector = true,
}) {
  const { t } = useTranslation();
  const { toastSet } = useContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [cartItemQuantity, setCartItemQuantity] = useState(0);

  // Check if user is logged in
  if (!mongoUser?._id) {
    return null;
  }

  // Check if item is already in cart on component mount
  useEffect(() => {
    const checkCartStatus = async () => {
      try {
        const cartItem = await getOne({
          col: "usercarts",
          data: {
            createdBy: mongoUser._id,
            storeItemId: storeItem._id,
          },
        });
        setIsInCart(!!cartItem);
        setCartItemQuantity(cartItem?.quantity || 0);
      } catch (error) {
        console.error("Error checking cart status:", error);
      }
    };

    if (mongoUser?._id && storeItem?._id) {
      checkCartStatus();
    }
  }, [mongoUser?._id, storeItem?._id]);

  const handleAddToCart = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const result = await add({
        col: "usercarts",
        data: {
          createdBy: mongoUser._id,
          storeItemId: storeItem._id,
          quantity: quantity,
        },
      });

      if (result?.error) {
        if (
          result.error.includes("duplicate") ||
          result.error.includes("unique")
        ) {
          toastSet({
            isOpen: true,
            title: t("itemAlreadyInCart"),
          });
          setIsInCart(true);
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
      console.error("Add to cart error:", error);
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
    if (isLoading || newQuantity < 1) return;

    setIsLoading(true);

    try {
      const result = await update({
        col: "usercarts",
        data: {
          createdBy: mongoUser._id,
          storeItemId: storeItem._id,
        },
        update: {
          quantity: newQuantity,
        },
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      setCartItemQuantity(newQuantity);
      toastSet({
        isOpen: true,
        title: t("cartUpdated"),
      });
    } catch (error) {
      console.error("Update quantity error:", error);
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
      const result = await removeOne({
        col: "usercarts",
        data: {
          createdBy: mongoUser._id,
          storeItemId: storeItem._id,
        },
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
      console.error("Remove from cart error:", error);
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
    if (!showQuantitySelector || variant === "icon-only") return null;

    return (
      <div className="f aic g5 border rounded-lg px8 py5 bg-background">
        <button
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          disabled={quantity <= 1}
          className="f aic jcc w20 h20 rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Minus size={12} />
        </button>
        <span className="min-w-[30px] text-center text-sm font-medium">
          {quantity}
        </span>
        <button
          onClick={() => setQuantity(quantity + 1)}
          className="f aic jcc w20 h20 rounded hover:bg-muted"
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
        <div className="f aic g5 border rounded-lg px8 py5 bg-background">
          <button
            onClick={() => handleUpdateQuantity(cartItemQuantity - 1)}
            disabled={cartItemQuantity <= 1 || isLoading}
            className="f aic jcc w20 h20 rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Minus size={12} />
          </button>
          <span className="min-w-[30px] text-center text-sm font-medium">
            {cartItemQuantity}
          </span>
          <button
            onClick={() => handleUpdateQuantity(cartItemQuantity + 1)}
            disabled={isLoading}
            className="f aic jcc w20 h20 rounded hover:bg-muted"
          >
            <Plus size={12} />
          </button>
        </div>
        <button
          onClick={handleRemoveFromCart}
          disabled={isLoading}
          className="px10 py5 bg-destructive hover:bg-destructive/80 text-destructive-foreground rounded-lg text-sm font-medium transition-colors"
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
      default: "px15 py10 bg-accent hover:bg-accent/80 text-accent-foreground",
      compact:
        "px10 py8 bg-accent hover:bg-accent/80 text-accent-foreground text-sm",
      "icon-only":
        "p10 bg-accent hover:bg-accent/80 text-accent-foreground rounded-full",
    };

    const buttonClasses = `${baseClasses} ${
      variantClasses[variant]
    } ${className} ${
      isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
    }`;

    const icon = <ShoppingCart size={variant === "icon-only" ? 16 : 18} />;
    const text = t("addToCart");

    return (
      <button
        onClick={handleAddToCart}
        disabled={isLoading}
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
      <div className="f aic g10">
        {showQuantitySelector && renderQuantitySelector()}
        {renderAddButton()}
      </div>
    );
  };

  const renderWithPrice = () => {
    if (!showPrice || !storeItem?.price) {
      return renderContent();
    }

    return (
      <div className="fc g10">
        <div className="text-lg font-bold text-foreground">
          {formatPrice(storeItem.price)}
        </div>
        {renderContent()}
      </div>
    );
  };

  return showPrice ? renderWithPrice() : renderContent();
}
