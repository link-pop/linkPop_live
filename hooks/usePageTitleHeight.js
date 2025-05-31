"use client";

import { usePathname } from "next/navigation";
import { ONBOARDING_ROUTE } from "@/lib/utils/constants";
import { SITE2 } from "@/config/env";

/**
 * Hook to get the PageTitle height for layout calculations
 * Returns the height in pixels that should be subtracted from 100dvh
 */
export default function usePageTitleHeight() {
  const pathname = usePathname();

  // If SITE2, no PageTitle is rendered
  if (SITE2) return 0;

  // If on onboarding route, no PageTitle is rendered
  if (pathname?.startsWith(ONBOARDING_ROUTE)) return 0;

  // PageTitle has h60 class which is 60px
  return 60;
}
