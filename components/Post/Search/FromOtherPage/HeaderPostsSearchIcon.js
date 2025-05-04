"use client";

import { Search } from "lucide-react";
import { usePathname } from "next/navigation";

export default function HeaderPostsSearchIcon({ className }) {
  let pathname = usePathname();
  const isVisible = [
    "/products",
    "/articles",
    "/analytics",
    "/reviews",
    "/users",
    "/orders",
  ].includes(pathname);

  return (
    isVisible && (
      <div onClick={() => document.querySelector(".PostsSearchBtn")?.click()}>
        <Search className={className} />
      </div>
    )
  );
}
