"use client";

import { useCart } from "@/components/Cart/CartContext";
import CartSheet from "./CartSheet";
import { ShoppingCart } from "lucide-react";

export default function CartIcon({ className = "" }) {
  const { cartItems } = useCart();
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartSheet>
      <div className="relative cursor-pointer">
        <ShoppingCart className={`${className}`} />
        {itemCount > 0 && (
          <div className="absolute zi2 -top-2 -right-2 w-5 h-5 bg-[var(--color-brand)] rounded-full flex items-center justify-center text-white text-xs">
            {itemCount}
          </div>
        )}
      </div>
    </CartSheet>
  );
}
