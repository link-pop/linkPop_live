"use client";

import { useCart } from "@/components/Cart/CartContext";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils/formatPrice";
import { slugify } from "@/lib/utils/slugify";
import { Minus, Plus, Trash2 } from "lucide-react";
import TextShortener from "../ui/shared/TextShortener/TextShortener";
import { useRouter } from "next/navigation";

export default function CartItems({
  onClose,
  userOwnCart = true,
  className = "",
}) {
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const router = useRouter();

  const navigateToProduct = (item) => {
    const titleSlug = slugify(item.title);
    router.push(`/products/${titleSlug}`);
    if (onClose) onClose();
  };

  return (
    <div className={`!oxh flex flex-col gap-5 pr15 ${className}`}>
      {cartItems.map((item) => (
        <div key={item._id} className="CartItem flex items-center gap-4 pb-4">
          {item.files?.[0]?.fileUrl && (
            <img
              src={item.files[0].fileUrl}
              alt={item.title}
              className="asfs w-20 h-20 object-cover rounded-lg"
            />
          )}
          <div className="flex-1">
            <h3
              className="font-medium cursor-pointer brand hover:tdu"
              onClick={() => navigateToProduct(item)}
            >
              {item.title}
            </h3>

            <TextShortener
              text={item.subtitle}
              className="text-sm text-gray-500 mb-1"
            />

            {/* EACH ITEM TOTAL */}
            <div key={item.quantity} className="abounce fw500 text-sm black">
              {item.quantity > 1 &&
                formatPrice(
                  (item["discounted price"] || item.price) * item.quantity
                )}
            </div>

            {/* EACH ITEM PRICE */}
            <div className="text-sm text-gray-500">
              {formatPrice(item["discounted price"] || item.price)}{" "}
              {item.quantity > 1 && "each"}
            </div>

            {userOwnCart && (
              <div className="flex items-center gap-2 mt-2">
                <Button
                  // - BUTTON
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    const newQuantity = item.quantity - 1;
                    if (newQuantity === 0) {
                      e.target
                        .closest(".CartItem")
                        ?.classList.add("afaderight");
                      setTimeout(
                        () => updateQuantity(item._id, newQuantity),
                        500
                      );
                    }
                    newQuantity > 0 && updateQuantity(item._id, newQuantity);
                  }}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                {/* EACH ITEM QUANTITY */}
                <span key={item.quantity} className="abounce w-8 text-center">
                  {item.quantity}
                </span>
                <Button
                  // + BUTTON
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => updateQuantity(item._id, item.quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  // removeFromCart BUTTON
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 ml-auto text-red-500 hover:text-red-600"
                  onClick={(e) => (
                    e.target.closest(".CartItem")?.classList.add("afaderight"),
                    setTimeout(() => removeFromCart(item._id), 500)
                  )}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
