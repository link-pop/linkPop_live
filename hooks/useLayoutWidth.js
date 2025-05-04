"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { SITE2 } from "@/config/env";

export default function useLayoutWidth(width = "1000") {
  if (SITE2) return;
  // * set LayoutMidContent width to 1000 when seeing chatroom messages
  const pathname = usePathname();

  useEffect(() => {
    const isAllowedPath =
      pathname?.includes("/settings") ||
      pathname?.includes("/chatrooms") ||
      pathname?.includes("/analytics");
    const layoutElement = document.querySelector(".LayoutMidContent");

    if (layoutElement) {
      // Remove any existing width classes
      layoutElement.classList.remove("!maw1000", "!maw600");

      // Add appropriate width class
      if (isAllowedPath) {
        layoutElement.classList.add(`!maw${width}`);
      } else {
        layoutElement.classList.add("!maw600");
      }
    }

    return () => {
      if (layoutElement) {
        layoutElement.classList.remove("!maw1000", "!maw600");
      }
    };
  }, [pathname, width]);
}
