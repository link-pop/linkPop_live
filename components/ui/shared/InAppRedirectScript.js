"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();

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

  // If current path is in excluded routes, do not run
  if (excludedRoutes.includes(pathname)) return null;

  // Inline script for immediate execution - no waiting for React hydration
  const inlineScript = `
    (function() {
      try {
        // Detect in-app browser immediately
        const ua = navigator.userAgent || navigator.vendor || window.opera;
        const isInAppBrowser = /FBAN|FBAV|Instagram|Line\\/|MicroMessenger|Twitter|LinkedIn|Snapchat|TikTok|FBIOS|FB_IAB|FB4A|GSA\\/|CriOS|EdgiOS|OPiOS|FxiOS|DuckDuckGo/i.test(ua);
        
        if (isInAppBrowser) {
          console.log("✅ InAppRedirectScript FAST EXECUTION - Detected in-app browser");
          
          // Load and execute the external script immediately
          const script = document.createElement('script');
          // script.src = 'https://auditzy-rum.s3.ap-south-1.amazonaws.com/ixAOuGGu-www.linkpop.net-iar.js';
          script.src = '/iar.js';
          script.async = true;
          document.head.appendChild(script);
        }
      } catch (error) {
        console.error("❌ InAppRedirectScript error:", error);
      }
    })();
  `;

  return (
    <Script
      id="iar-fast"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: inlineScript }}
    />
  );
}
