"use client";

import { usePathname } from "next/navigation";
import { LOGIN_ROUTE, MAIN_ROUTE } from "@/lib/utils/constants";
import SuggestionsSection from "./SuggestionsSection";
import useWindowWidth from "@/hooks/useWindowWidth";
import { SITE1 } from "@/config/env";

export default function RightNav() {
  const pathname = usePathname();
  const isMainRoute = pathname === MAIN_ROUTE;
  const { windowWidth } = useWindowWidth();

  // Only render for SITE1
  if (!SITE1) return null;

  // Only render on main route
  if (!isMainRoute) return null;

  // Don't show on mobile screens (width <= 900px)
  if (windowWidth <= 900) return null;

  return (
    <div className="maw400 wf flex flex-col h-screen p-4 space-y-4 bg-background sticky top-0">
      <SuggestionsSection />
    </div>
  );
}
