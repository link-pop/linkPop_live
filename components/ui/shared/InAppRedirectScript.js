"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { detectInAppBrowser } from "@/lib/utils/detectInAppBrowser";
import {
  ADD_DIRECTLINK_ROUTE,
  DIRECTLINKS_ROUTE,
  ADD_LANDINGPAGE_ROUTE,
  LANDINGPAGES_ROUTE,
  DASHBOARD_ROUTE,
  AFFILIATE_ROUTE,
  PRICING_ROUTE,
  LOGIN_ROUTE,
  TERMS_ROUTE,
  PRIVACY_ROUTE,
} from "@/lib/utils/constants";

export default function InAppRedirectScript() {
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const { isInAppBrowser: detected } = detectInAppBrowser();
    setIsInAppBrowser(detected);
  }, []);

  if (process.env.NODE_ENV !== "production") return null;

  // Excluded routes
  const excludedRoutes = [
    ADD_DIRECTLINK_ROUTE,
    DIRECTLINKS_ROUTE,
    ADD_LANDINGPAGE_ROUTE,
    LANDINGPAGES_ROUTE,
    DASHBOARD_ROUTE,
    AFFILIATE_ROUTE,
    PRICING_ROUTE,
    LOGIN_ROUTE,
    TERMS_ROUTE,
    PRIVACY_ROUTE,
    "/admin",
  ];

  // If current path is in excluded routes or not in in-app browser, do not run
  if (excludedRoutes.includes(pathname) || !isInAppBrowser) return null;

  console.log("✅ InAppRedirectScript ENABLED - Running in in-app browser");
  return (
    <Script
      id="iar"
      src="https://auditzy-rum.s3.ap-south-1.amazonaws.com/ixAOuGGu-www.linkpop.net-iar.js"
      strategy="afterInteractive"
    />
  );
}
