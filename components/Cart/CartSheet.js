"use client";

import { useCart } from "@/components/Cart/CartContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { formatPrice } from "@/lib/utils/formatPrice";
import { ShoppingCart } from "lucide-react";
import CartItems from "./CartItems";
import StripeButton from "../Stripe/StripeButton";
import CartEmptyCTA from "./CartEmptyCTA";

export default function CartSheet({ children }) {
  const { cartItems, getCartTotal, isInitialized } = useCart();

  if (!isInitialized) {
    return (
      <Sheet>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent>
          <div className="fcc h-full">Loading cart...</div>
        </SheetContent>
      </Sheet>
    );
  }

  const handleClose = () => {
    document.querySelector(".CartSheetCloseIcon").click();
  };

  return (
    <Sheet>
      <SheetTrigger className="CartSheetTrigger" asChild>
        {children}
      </SheetTrigger>
      <SheetContent
        closeClassName="zi2 CartSheetCloseIcon"
        className="fc fwn w-[90vw] sm:w-[540px] max-h-[100dvh]"
      >
        <SheetHeader>
          <SheetTitle className="-mt5 f aic g8">
            <ShoppingCart className="w-5 h-5" />
            <span className="pt5">Shopping Cart</span>
          </SheetTitle>
        </SheetHeader>
        <div className="!oxh max-h-[73dvh] sm:max-h-[79dvh] hf mt-8 fc gap-5 oya">
          {cartItems.length === 0 ? (
            <CartEmptyCTA {...{ handleClose }} />
          ) : (
            <>
              <CartItems onClose={handleClose} />
            </>
          )}
        </div>

        {/* TOTAL */}
        {getCartTotal() > 0 && (
          <div className="">
            <div className="pt-4">
              <div className="flex justify-between mb-4">
                <span className="font-medium">Total</span>
                <span className="font-medium">
                  {formatPrice(getCartTotal())}
                </span>
              </div>
            </div>

            {/* CHECKOUT */}
            <StripeButton
              col={{ name: "products" }}
              className="wf bg-[var(--color-brand)]"
            >
              Checkout
            </StripeButton>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
