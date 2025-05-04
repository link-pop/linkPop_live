"use client";

import { useEffect, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { nanoid } from "nanoid";
import { useContext } from "@/components/Context/Context";
import { ANALYTICS_ROUTE } from "@/lib/utils/constants";
import { fetchGeoData } from "@/lib/utils/fetchGeoData";
import { getPlatformType } from "@/lib/utils/getPlatformInfo";
import { getBrowserType } from "@/lib/utils/getBrowserInfo";
import { getSystemType } from "@/lib/utils/getSystemInfo";
import { useUser } from "@clerk/nextjs";

export const useWriteAnalytics = ({ mongoUser }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isLoaded: isClerkLoaded, isSignedIn } = useUser();
  const postType = pathname.split("/")[1];

  // ! for analytics 2/3: get fullPostId from localStorage
  if (typeof window === "undefined") return;
  const postId = localStorage.getItem("fullPostId");

  const trackPageView = useCallback(async () => {
    try {
      // Wait for Clerk to be loaded to know if user is authenticated
      if (!isClerkLoaded) {
        // console.log("Clerk not loaded yet");
        return;
      }

      // For authenticated users, wait for MongoDB user
      if (isSignedIn && !mongoUser) {
        // console.log("Authenticated user's MongoDB data not loaded yet");
        return;
      }

      const visitorId = localStorage.getItem("visitorId") || nanoid();
      localStorage.setItem("visitorId", visitorId);

      // * store analyticsData.referrer
      const previousPath = localStorage.getItem("currentPath") || ""; // Get previous path from localStorage as referrer
      localStorage.setItem("currentPath", pathname); // Store current path for next navigation

      // * don't record page reloads
      if (pathname === previousPath) {
        console.log("Page reload are not tracked in analytics");
        return;
      }

      // * don't record analytics page visits
      if (pathname.includes(ANALYTICS_ROUTE)) {
        console.log("Analytics page visit are not tracked in analytics");
        return;
      }

      const geoData = await fetchGeoData();

      const analyticsData = {
        path: pathname,
        searchParams: searchParams?.toString() || undefined,
        visitorId,
        userId: isSignedIn ? mongoUser?._id : undefined,
        userAgent: window.navigator.userAgent,
        referrer: previousPath,
        countryCode: geoData?.country_code,
        platformType: getPlatformType(),
        browserType: getBrowserType(),
        systemType: getSystemType(),
        postType,
        postId,
        email: isSignedIn ? mongoUser?.email : undefined,
        screenResolution: window.screen.width + "x" + window.screen.height,
        language: window.navigator.language,
        deviceMemory: window.navigator.deviceMemory,
        timeZone: geoData?.timezone,
        hardwareConcurrency: window.navigator.hardwareConcurrency,
        colorScheme: window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light",
        reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)")
          .matches
          ? "disabled"
          : "enabled",
        cookiesEnabled: navigator.cookieEnabled ? "enabled" : "disabled",
      };

      const response = await fetch("/api/analytics/write-analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(analyticsData),
      });

      // ! for analytics 3/3: remove fullPostId from localStorage
      localStorage.removeItem("fullPostId");

      if (!response.ok) {
        throw new Error(
          `Analytics request failed with status ${response.status}`
        );
      }
    } catch (error) {
      console.error("Failed to track page view:", error.message);
    }
  }, [pathname, searchParams, mongoUser, isClerkLoaded, isSignedIn]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      trackPageView();
    }, 1);

    return () => clearTimeout(timeoutId);
  }, [trackPageView]);
};
