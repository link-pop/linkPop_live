"use client";

import { useEffect, useState } from "react";
import { fetchGeoData } from "@/lib/utils/fetchGeoData";
import { add } from "@/lib/actions/crud";

export default function ClientSideProfileTracker({
  visitorId,
  profileId,
  profileType,
  ipAddress,
  userAgent,
  referrer,
  redirected = false,
  destinationUrl = null,
  collectionName,
  redirectUrl = null,
  shieldProtection = false,
  safePageUrl = null,
  createdBy = null,
}) {
  const [tracked, setTracked] = useState(false);
  const [error, setError] = useState(null);

  // Hide the footer when this component mounts
  useEffect(() => {
    const footer = document.querySelector("footer");
    if (footer) {
      footer.style.display = "none";
      return () => {
        footer.style.display = "";
      };
    }
  }, []);

  // Function to check if visitor is potentially a bot or moderator
  function checkForThreats(userAgent, geoData, referrer) {
    // Check user agent for common bot signatures
    const botPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /google/i,
      /baidu/i,
      /bing/i,
      /yahoo/i,
      /facebook/i,
      /instagram/i,
      /moderator/i,
      /monitor/i,
    ];

    const isUserAgentSuspicious = botPatterns.some((pattern) =>
      pattern.test(userAgent || "")
    );

    // Check for proxy, VPN or hosting indicators
    const isProxyOrHosting = !!(geoData?.proxy || geoData?.hosting);

    // Flag visitor if any of these conditions are true
    return isUserAgentSuspicious || isProxyOrHosting;
  }

  useEffect(() => {
    async function trackVisit() {
      try {
        console.log("Starting profile tracking");

        // Get geo data using the client-side function
        const geoData = await fetchGeoData();
        console.log("Geo data received in tracker:", geoData);

        // Check if visitor is the profile owner (don't track owner analytics)
        const isProfileOwner =
          visitorId && profileId && visitorId === profileId;

        // Check if visitor is the creator of the directlink or landing page
        const isProfileCreator =
          visitorId &&
          createdBy &&
          (typeof createdBy === "string"
            ? createdBy === visitorId
            : createdBy?._id && createdBy._id === visitorId);

        // Skip tracking for profile owners and creators
        if (isProfileOwner || isProfileCreator) {
          console.log(
            `Skipping analytics tracking - visitor is the ${
              isProfileOwner ? "profile owner" : "content creator"
            }`
          );
          setTracked(true);

          // Handle redirects even if we skip tracking
          if (redirectUrl) {
            window.location.href = redirectUrl;
          }
          return;
        }

        // Basic visitor data
        const visitorData = {
          visitorId,
          profileId,
          profileType,
          ipAddress,
          userAgent,
          referrer,
          redirected,
          destinationUrl,
        };

        // Add geo data if available
        if (geoData) {
          // Explicitly add each field to ensure they're included
          visitorData.country_code = geoData.country_code;
          visitorData.country_name = geoData.country_name;
          visitorData.language = geoData.language;
          visitorData.timezone = geoData.timezone;
          visitorData.city = geoData.city;
          visitorData.region = geoData.region;
          visitorData.latitude = geoData.latitude;
          visitorData.longitude = geoData.longitude;
          visitorData.isp = geoData.isp;
          visitorData.org = geoData.org;
          visitorData.mobile = geoData.mobile;
          visitorData.proxy = geoData.proxy;
          visitorData.hosting = geoData.hosting;
          visitorData.geo_source = geoData.geo_source;
        }

        // Check if the visitor is a bot or using VPN before saving to analytics
        const isThreat = checkForThreats(userAgent, geoData, referrer);

        if (!isThreat) {
          // Only save to analytics if not a bot or VPN
          console.log("Final visitor data being saved:", visitorData);

          // Save the visit data
          const result = await add({
            col: collectionName,
            data: visitorData,
            revalidate: false,
          });

          console.log("Tracking result:", result);

          if (result.error) {
            throw new Error(result.error);
          }
        } else {
          console.log("Bot or VPN detected - skipping analytics tracking");
        }

        setTracked(true);

        // Shield Protection Logic
        if (shieldProtection && redirectUrl) {
          // Determine if the visitor is potentially a bot or moderator
          const potentialThreat = isThreat;

          if (potentialThreat && safePageUrl) {
            // Redirect to safe page if visitor is flagged
            console.log("Shield Protection: Redirecting to safe page");
            window.location.href = safePageUrl;
          } else {
            // Redirect to original destination
            console.log("Shield Protection: Redirecting to destination");
            window.location.href = redirectUrl;
          }
        } else if (redirectUrl) {
          // No shield protection, redirect directly
          window.location.href = redirectUrl;
        }
      } catch (err) {
        console.error("Error tracking profile visit:", err);
        setError(err.message || "Unknown error occurred");

        // Still redirect even if tracking fails
        if (redirectUrl) {
          window.location.href = redirectUrl;
        }
      }
    }

    if (!tracked && !error) {
      trackVisit();
    }
  }, [
    tracked,
    error,
    visitorId,
    profileId,
    profileType,
    ipAddress,
    userAgent,
    referrer,
    redirected,
    destinationUrl,
    collectionName,
    redirectUrl,
    shieldProtection,
    safePageUrl,
    createdBy,
  ]);

  // Add debugging message for development
  if (process.env.NODE_ENV === "development" && error) {
    return <div className="hidden">Tracking error: {error}</div>;
  }

  // This component doesn't render anything visible in production
  return null;
}
