"use client";

import { CHATS_ROUTE } from "@/lib/utils/constants";
import { usePathname } from "next/navigation";

export default function NoFooterPages({ children }) {
  const pathname = usePathname();
  const noFooterPages = [
    "products",
    "articles",
    "reviews",
    "analytics",
    "orders",
    "add/product",
    "update/product",
    "add/article",
    "update/article",
    CHATS_ROUTE.slice(1),
  ];

  if (noFooterPages.some((page) => pathname.includes(`/${page}`))) return null;
  return children;
}
