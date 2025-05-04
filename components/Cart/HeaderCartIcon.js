import React from "react";
import CartSheet from "./CartSheet";
import CartIcon from "./CartIcon";

export default function HeaderCartIcon({ className = "" }) {
  return (
    <CartSheet>
      <CartIcon className={`HeaderCartIcon ${className}`} />
    </CartSheet>
  );
}
