"use client";

import SocialMediaLinks from "@/app/my/settings/social-media/SocialMediaLinks";
import { useRef, useEffect, memo, useCallback } from "react";

// Convert to a memoized component
const LandingPageSocialLinksEditor = memo(
  function LandingPageSocialLinksEditor({
    mongoUser,
    formData,
    setCreatedLinksCount,
    refreshPreviewTrigger,
    setRefreshPreviewTrigger,
  }) {
    // Track if this is the first mount
    const isFirstMount = useRef(true);

    // Create a more direct refresh function to ensure changes are reflected in the preview
    // Memoize the function so it doesn't change on each render
    const triggerPreviewRefresh = useCallback(
      (refreshSocialLinks = true) => {
        if (!setRefreshPreviewTrigger) return;

        console.log(
          "LandingPageSocialLinksEditor triggering preview refresh",
          refreshSocialLinks ? "with" : "without",
          "social links refresh"
        );

        // Always pass an object with the count and whether to refresh social links
        setRefreshPreviewTrigger((prev) => ({
          count: typeof prev === "object" ? prev.count + 1 : prev + 1,
          refreshSocialLinks,
        }));
      },
      [setRefreshPreviewTrigger]
    );

    // Just update the count without triggering a refresh from this component
    const handleLinksCountChange = useCallback(
      (count) => {
        setCreatedLinksCount(count);
      },
      [setCreatedLinksCount]
    );

    // Trigger a refresh on initial mount to ensure links are loaded
    // This is important when directly navigating to step 2
    useEffect(() => {
      if (
        isFirstMount.current &&
        formData?.landingPageId &&
        setRefreshPreviewTrigger
      ) {
        // Wait a bit to ensure everything is initialized
        const timer = setTimeout(() => {
          // On first mount, always refresh social links
          triggerPreviewRefresh(true);
          console.log(
            "Initial refresh for LandingPageSocialLinksEditor with social links"
          );
        }, 800);

        isFirstMount.current = false;
        return () => clearTimeout(timer);
      }
    }, [
      formData?.landingPageId,
      setRefreshPreviewTrigger,
      triggerPreviewRefresh,
    ]);

    // Create a memoized refreshPreviewCallback for social media links component
    const refreshCallback = useCallback(
      (updateFn) => {
        // Make sure we're always passing the correct object format with refreshSocialLinks=true
        if (typeof updateFn === "function") {
          // The updateFn is the function that modifies the previous value
          setRefreshPreviewTrigger((prev) => {
            const newValue = updateFn(prev);
            // If the updateFn returned a number, convert it to our object format
            if (typeof newValue === "number") {
              return {
                count: newValue,
                refreshSocialLinks: true,
              };
            }
            // Make sure the returned object has refreshSocialLinks set to true
            return {
              ...newValue,
              refreshSocialLinks: true,
            };
          });
        } else {
          // If just a value was passed, use our triggerPreviewRefresh
          triggerPreviewRefresh(true);
        }
      },
      [setRefreshPreviewTrigger, triggerPreviewRefresh]
    );

    // Use a stable key for the components
    const socialKey =
      typeof refreshPreviewTrigger === "object"
        ? `social-${refreshPreviewTrigger.count}`
        : `social-${refreshPreviewTrigger}`;

    const otherKey =
      typeof refreshPreviewTrigger === "object"
        ? `other-${refreshPreviewTrigger.count}`
        : `other-${refreshPreviewTrigger}`;

    return (
      <div className="p15 pb30 mb15">
        <SocialMediaLinks
          key={socialKey}
          mongoUser={mongoUser}
          formData={formData}
          showSocialMediaLinksDisplay={false}
          setCreatedLinksCount={handleLinksCountChange}
          refreshPreviewCallback={refreshCallback}
        />

        <hr className="mt33 mb30" />

        <SocialMediaLinks
          key={otherKey}
          mode="other"
          mongoUser={mongoUser}
          formData={formData}
          showSocialMediaLinksDisplay={false}
          setCreatedLinksCount={handleLinksCountChange}
          refreshPreviewCallback={refreshCallback}
        />
      </div>
    );
  }
);

export default LandingPageSocialLinksEditor;
