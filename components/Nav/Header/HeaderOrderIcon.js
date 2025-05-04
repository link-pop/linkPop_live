import { ORDERS_ROUTE } from "@/lib/utils/constants";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function HeaderOrderIcon({ className = "", mongoUser }) {
  return (
    <Link
      href={
        !mongoUser
          ? `${ORDERS_ROUTE}`
          : `${ORDERS_ROUTE}?userId=${mongoUser?._id}`
      }
    >
      <ShoppingBag className={`${className}`} />
    </Link>
  );
}
