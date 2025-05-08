"use client";

import CategoryToggle from "@/components/ui/shared/CategoryToggle/CategoryToggle";
import { usePathname } from "next/navigation";

export default function ProductPostsTopCustomContent({
  col,
  posts,
  showCategories,
}) {
  if (col.name !== "products") return null;
  const pathname = usePathname();
  // Check if viewing a user profile directly from root
  if (pathname.match(/^\/[^\/]+$/)) return null;

  return (
    showCategories &&
    posts.length > 0 && (
      <div className="my15">
        <CategoryToggle />
      </div>
    )
  );
}
