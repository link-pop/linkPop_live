"use client";

import { useState } from "react";
import { useCart } from "@/components/Cart/CartContext";
import { Button } from "@/components/ui/button";
import Button2 from "@/components/ui/shared/Button/Button";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { useRequireAuth } from "@/lib/utils/auth/useRequireAuth";
import { usePathname } from "next/navigation";
import { useContext } from "../Context/Context";

export default function AddToCartButton({
  post,
  showQuantity = false,
  className = "",
}) {
  const { cartItems, addToCart } = useCart();
  const noLoggedInUser = useRequireAuth();
  const [quantity, setQuantity] = useState(1);
  const { mongoUser, toastSet } = useContext();

  // ! skip render if viewing another user's cart: only show button for cart owner
  const pathname = usePathname();
  // Extract username from path when it matches the pattern /username
  const pageUserId = pathname.match(/^\/([^\/]+)$/) ? pathname.slice(1) : null;
  if (pathname.match(/^\/[^\/]+$/) && pageUserId !== mongoUser?._id)
    return null;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (noLoggedInUser()) return;
    addToCart(post, quantity);
    toastSet({ isOpen: false });
    setTimeout(() => {
      toastSet({
        isOpen: true,
        title: `${post.title} added to cart`,
        comp: <img className="br10 mr5 w40 h40" src={post.files[0].fileUrl} />,
        onClick: () => (
          document.querySelector(".CartSheetTrigger")?.click(),
          toastSet({ isOpen: false })
        ),
      });
    }, 1);

    e.target.closest("button")?.classList.remove("aconfetti");
    document.querySelector(".HeaderCartIcon")?.classList.remove("aconfetti");
    setTimeout(() => {
      e.target.closest("button")?.classList.add("aconfetti");
      document.querySelector(".HeaderCartIcon")?.classList.add("aconfetti");
    }, 1);
  };

  // Find item in cart by matching _id
  const itemInCart = cartItems.find((item) => item._id === post._id);
  const itemCount = itemInCart ? itemInCart.quantity : 0;
  // when ProductFullPost (server) loaded, the useCart=>CartProvider (client) is not yet loaded
  const noUserLoadedClass = !mongoUser?._id ? "op30 pen" : "";

  // * Button with NO quantity
  if (!showQuantity) {
    return (
      <Button2
        onClick={handleAddToCart}
        hoverClassName="bg-blue-100 fw600"
        className={`!rounded-bl-[10px] !rounded-br-[10px] !animate-none !border-none br0 wf fcc mxa h45 bg-[var(--color-brand)] hover:bg-[var(--color-white)] text-[var(--color-white)] hover:text-[var(--color-brand)] ${className} ${noUserLoadedClass}`}
      >
        {/* <ShoppingCart className="w-4 h-4 mr-2" /> */}
        <span key={itemCount} className="ttu fz12 aconfetti">
          {itemCount > 0 ? `${itemCount} in cart` : "Add to Cart"}
        </span>
      </Button2>
    );
  }

  // * Button WITH quantity (+/-)
  return (
    <div className={`flex items-center mb-4 ${className} ${noUserLoadedClass}`}>
      <Button
        variant="outline"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          setQuantity(quantity > 1 ? quantity - 1 : 1);
        }}
      >
        <Minus className="w-4 h-4" />
      </Button>
      <span key={quantity} className="abounce mx-4">
        {quantity}
      </span>
      <Button
        variant="outline"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          setQuantity(quantity + 1);
        }}
      >
        <Plus className="w-4 h-4" />
      </Button>
      <Button
        className="btn_brand hover:bg-blue-600 ml15"
        onClick={handleAddToCart}
      >
        Add to cart
      </Button>
      {itemCount > 0 && (
        <span key={itemCount} className="abounce ml-3 text-sm text-gray-600">
          {itemCount} in cart
        </span>
      )}
    </div>
  );
}
