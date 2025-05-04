import Link from "next/link";

export default function CartEmptyCTA({ handleClose, className = "" }) {
  return (
    <div className={`👋 fcc relative cy pb30 ${className}`}>
      <div className="fw500 mb15 tac text-gray-500">
        Your cart is currently empty!
      </div>
      <Link className="btn_brand" onClick={handleClose} href="/products">
        Start Shopping
      </Link>
    </div>
  );
}
