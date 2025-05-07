"use client";

import ProfileImages from "@/app/my/settings/profile/ProfileImages";
import RichTextContent from "@/components/ui/shared/RichTextContent/RichTextContent";
import SocialMediaLinksDisplay from "@/components/ui/shared/SocialMediaLinks/SocialMediaLinksDisplay";
import OtherLinksDisplay from "@/components/ui/shared/SocialMediaLinks/OtherLinksDisplay";
import { useEffect, useState, useRef, memo } from "react";
import { getSocialMediaLinks } from "@/lib/actions/getSocialMediaLinks";
import ProfileNotFound from "@/components/ui/shared/ProfileNotFound/ProfileNotFound";
import useLandingPageCustomization from "@/hooks/useLandingPageCustomization";
import { useTranslation } from "@/components/Context/TranslationContext";
import { Clock, MapPin } from "lucide-react";
import ViewPreviewButton from "@/components/Custom/ViewPreviewButton";
import CopyLinkButton from "@/components/Custom/CopyLinkButton";
import { fetchGeoData } from "@/lib/utils/fetchGeoData";

// Countdown timer component that updates every second
const PromotionCountdown = ({ endsAt }) => {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    // Function to calculate and format time left
    const calculateTimeLeft = () => {
      const now = new Date();
      const endTime = new Date(endsAt);
      const difference = endTime - now;

      // If countdown is over
      if (difference <= 0) {
        return "";
      }

      // Calculate hours, minutes, seconds
      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      // Format the time string
      let timeString = "";
      if (hours > 0) timeString += `${hours}h `;
      if (minutes > 0 || hours > 0) timeString += `${minutes}m `;
      timeString += `${seconds}s`;

      return timeString;
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Setup interval to update every second
    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      // Clear interval when countdown ends
      if (!remaining) {
        clearInterval(timer);
      }
    }, 1000);

    // Cleanup on unmount
    return () => clearInterval(timer);
  }, [endsAt]);

  if (!timeLeft) return null;

  return (
    <span className="text-xs landing-page-text opacity-75 ml-1">
      {t("endsIn") || "ends in"} {timeLeft}
    </span>
  );
};

// Convert to a memoized component to prevent unnecessary re-renders
const AddLandingPageFormPreview = memo(function AddLandingPageFormPreview({
  formData,
  mongoUser,
  profileImage,
  coverImage,
  refreshTrigger,
}) {
  const { t } = useTranslation();
  const [socialLinks, setSocialLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const previewContainerRef = useRef(null);
  const profileContainerRef = useRef(null);
  const fetchingRef = useRef(false); // Ref to track if we're currently fetching
  const [customStyleId] = useState(
    `preview-style-${formData?.landingPageId || "default"}`
  );
  const isFirstMount = useRef(true);
  const [visitorCity, setVisitorCity] = useState("");

  // Keep track of the last refresh that fetched social links
  const lastSocialLinksFetchRef = useRef(null);

  // Fetch visitor's city on component mount
  useEffect(() => {
    const getVisitorCity = async () => {
      try {
        const geoData = await fetchGeoData();
        if (geoData && geoData.city) {
          setVisitorCity(geoData.city);
        }
      } catch (error) {
        console.error("Error fetching visitor's city:", error);
      }
    };

    getVisitorCity();
  }, []);

  // Use the customization hook
  useLandingPageCustomization({
    id: formData?.landingPageId || "default",
    textColor: formData?.textColor,
    bgColor: formData?.bgColor,
    buttonTextColor: formData?.buttonTextColor,
    buttonBgColor: formData?.buttonBgColor,
    buttonRoundness: formData?.buttonRoundness,
    buttonAnimation: formData?.buttonAnimation,
    buttonShadow: formData?.buttonShadow,
    shadowColor: formData?.shadowColor,
    fontFamily: formData?.fontFamily,
    textFontSize: formData?.textFontSize,
    buttonFontSize: formData?.buttonFontSize,
    socialIconsType: formData?.socialIconsType,
    textShadow: formData?.textShadow,
    textShadowColor: formData?.textShadowColor,
    showOnline: formData?.showOnline,
    showCity: formData?.showCity,
    responseTime: formData?.responseTime,
    promotion: formData?.promotion,
    promotionTextColor: formData?.promotionTextColor,
    disableLinkLogos: formData?.disableLinkLogos,
    facebookPixelId: formData?.facebookPixelId,
    isPreview: true,
  });

  // Ensure we fetch links on first render
  useEffect(() => {
    if (isFirstMount.current && formData?.landingPageId) {
      isFirstMount.current = false;

      // Give time for things to initialize then fetch links
      const timer = setTimeout(() => {
        // Reset fetching state to ensure we can fetch
        fetchingRef.current = false;

        // Fetch the links directly
        getSocialMediaLinks(mongoUser?._id, formData.landingPageId)
          .then((links) => {
            if (links) {
              setSocialLinks(links);
              setLoading(false);
              // Store the fetch timestamp
              lastSocialLinksFetchRef.current = Date.now();
            }
          })
          .catch((err) => {
            console.error("Error on initial links fetch:", err);
            setLoading(false);
          });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [mongoUser?._id, formData?.landingPageId]);

  // Modify the existing useEffect to check for the refreshSocialLinks flag
  useEffect(() => {
    // Skip if no valid refresh trigger or no landing page ID
    if (!refreshTrigger || !formData?.landingPageId) {
      if (!formData?.landingPageId) {
        setLoading(false);
      }
      return;
    }

    // Skip if already fetching
    if (fetchingRef.current) {
      return;
    }

    // Extract social links refresh needs from refreshTrigger
    const shouldRefreshLinks =
      typeof refreshTrigger === "object" &&
      refreshTrigger !== null &&
      "refreshSocialLinks" in refreshTrigger
        ? refreshTrigger.refreshSocialLinks
        : false;

    // Get the count from refreshTrigger to know if it's a new refresh
    const currentCount =
      typeof refreshTrigger === "object"
        ? refreshTrigger.count
        : refreshTrigger;

    console.log(
      "Preview refresh triggered:",
      currentCount,
      "shouldRefreshLinks:",
      shouldRefreshLinks,
      "last fetch:",
      lastSocialLinksFetchRef.current
    );

    // If we're just updating styles/layout and not links data, skip the fetch
    if (!shouldRefreshLinks) {
      console.log("Skipping social links fetch - just updating UI");
      return;
    }

    // Function to fetch the links
    const fetchSocialLinks = async () => {
      // Set loading state immediately
      setLoading(true);
      fetchingRef.current = true;

      try {
        // Always fetch fresh data
        console.log("Fetching fresh social links for preview");
        const links = await getSocialMediaLinks(
          mongoUser?._id,
          formData.landingPageId,
          Date.now() // Use timestamp to bust cache
        );

        console.log("Got links:", links?.length || 0);
        setSocialLinks(links || []);
        // Store the fetch timestamp
        lastSocialLinksFetchRef.current = Date.now();
      } catch (error) {
        console.error("Failed to fetch social links for preview:", error);
      } finally {
        setLoading(false);
        fetchingRef.current = false;
      }
    };

    // Fetch the social links
    fetchSocialLinks();
  }, [formData?.landingPageId, mongoUser?._id, refreshTrigger]);

  // Format landing page data to be compatible with ProfileImages component
  const adaptedLandingPage = {
    ...formData,
    profileImage: profileImage || "/img/noProfileImage.png",
    coverImage: coverImage,
    name: formData.name,
    isOwner: true,
  };

  // Position the profile image properly after rendering
  useEffect(() => {
    const container = previewContainerRef.current;
    if (!container) return;

    // Get the profile image element
    const profileImageContainer = container.querySelector(
      ".PreviewProfileImage"
    );
    if (profileImageContainer) {
      // Position it centered horizontally and at the right vertical position
      profileImageContainer.style.position = "absolute";
      profileImageContainer.style.left = "50%";
      profileImageContainer.style.transform = "translateX(-50%)";
      profileImageContainer.style.top = "20px";
      profileImageContainer.style.zIndex = "10";
    }
  }, [refreshTrigger]);

  // Check if there are any "other" links available
  const hasOtherLinks = socialLinks.some((link) => link.platform === "other");

  // Add a helper function to get icon size based on font size
  // TODO !!!!!!!! HAS DUP => search : "349334365"
  const getIconSize = (fontSize, isIconOnly = false) => {
    const sizeMap = {
      default: isIconOnly ? 22 : 16,
      small: isIconOnly ? 20 : 14,
      medium: isIconOnly ? 22 : 16,
      large: isIconOnly ? 24 : 18,
      xl: isIconOnly ? 28 : 22,
      xxl: isIconOnly ? 32 : 24,
      xxxl: isIconOnly ? 36 : 28,
    };
    return sizeMap[fontSize] || 16;
  };

  // Calculate icon size based on button font size and socialIconsType
  const iconSize = getIconSize(
    formData?.buttonFontSize || "medium",
    formData?.socialIconsType === "type2"
  );

  // If the page is inactive, show the ProfileNotFound component
  if (formData.active === false) {
    return (
      <div className="fc g15 max-h-[85dvh] !oys !oxh">
        <div className="!oh border rounded-md bg-background shadow-sm">
          <ProfileNotFound
            customTitle={t("landingPageInactive") || "Landing Page Inactive"}
            customMessage={
              t("landingPageInactiveMessage") ||
              "This landing page is currently inactive and won't be visible to visitors."
            }
          />
        </div>
      </div>
    );
  }

  // Utility function to ensure a valid hex color
  const ensureValidHexColor = (color) => {
    // If color is undefined, empty, or not a valid hex, return default
    if (!color || color === "") return "#FF0000";

    // Check if it's a valid hex color pattern
    const isValidHex = /^#([0-9A-F]{3}){1,2}$/i.test(color);
    return isValidHex ? color : "#FF0000";
  };

  // Apply color validation to promotionTextColor
  const validatedColors = {
    ...formData,
    promotionTextColor: ensureValidHexColor(formData?.promotionTextColor),
  };

  return (
    <div className="!oyh !oxh !fc !fwn g15 max-h-[88dvh]">
      {/* Add CSS to remove transitions from social links */}
      <style jsx global>{`
        .SocialLinkNoAnimation a:not(.OtherLinkButton) {
          transition: none !important;
          animation: none !important;
        }

        .preview-scrollable-content {
          overflow-y: auto !important;
          overflow-x: hidden !important;
          height: 100% !important;
          max-height: 602px !important;
          border-radius: 32px !important;
        }

        @media (max-width: 640px) {
          .iphone-frame-container {
            transform: scale(0.9);
            transform-origin: top center;
            margin-top: 0 !important;
            padding-bottom: 15px;
          }
        }
      `}</style>

      {/* Mobile Preview Title */}
      <h2 className="!wf tac fz20 mt15 mb5 landing-page-text md:hidden">
        {t("preview") || "Preview"}
      </h2>

      {/* iPhone Frame Container */}
      <div
        className="por mxa iphone-frame-container w-full flex flex-col items-center justify-center pb-4"
        style={{ maxWidth: "320px" }}
      >
        {formData.landingPageId && (
          <div className="f aic g10 jcc mb-2 w-full">
            <ViewPreviewButton name={formData.name} label="view" />
            <CopyLinkButton name={formData.name} label="copy" />
          </div>
        )}

        <div className="por" style={{ width: "320px", height: "630px" }}>
          {/* Screen Content Container */}
          <div
            className="poa z-5 oh border-2 border-gray-200 dark:border-gray-700"
            style={{
              top: "12px",
              left: "21px",
              width: "278px",
              height: "602px",
              borderRadius: "32px",
              backgroundColor: "#fff",
            }}
          >
            {/* Actual preview content */}
            <div
              className={`preview-scrollable-content PreviewContainer-${
                formData?.landingPageId || "default"
              }`}
              ref={previewContainerRef}
            >
              {/* Removed pb999 class that was forcing excessive height */}
              <div className="fc mxa" style={{ maxWidth: "100%" }}>
                {/* Profile Images Container - Make it a relative container with fixed height */}
                <div className="por w-full h200" ref={profileContainerRef}>
                  <ProfileImages
                    mongoUser={mongoUser}
                    visitedMongoUser={adaptedLandingPage}
                    isLandingPage={true}
                    previewMode={true}
                    previewClasses={{
                      coverImage: "PreviewCoverImage",
                      profileImage: "PreviewProfileImage",
                    }}
                    customBgColor={formData.bgColor || null}
                  />
                </div>

                {/* Content Container that starts below the profile image */}
                <div className="por z1 wf pb15">
                  <div className="wbba fc g10 tac px15">
                    <div className="wf">
                      <h1
                        className={`${
                          !formData?.textColor ? "text-foreground" : ""
                        } !fz28 fw600 Username landing-page-text`}
                      >
                        {formData.name ||
                          mongoUser?.displayName ||
                          mongoUser?.name}
                      </h1>
                      <div className="text-sm landing-page-text opacity-85 mt-1">
                        @{formData.username}
                      </div>
                    </div>

                    {/* Display Online and City indicators */}
                    <div className="fc aic jcc g10 my-2">
                      {/* Group Online status and response time together in a single flex container */}
                      <div className="f aic jcc g10 wrap">
                        {formData.showOnline && (
                          <div className="f aic g5">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs landing-page-text">
                              {t("online") || "Online"}
                            </span>
                          </div>
                        )}

                        {/* Display response time if set */}
                        {formData.responseTime &&
                          formData.responseTime !== "none" &&
                          Number(formData.responseTime) !== 0 && (
                            <div className="f aic g5">
                              <Clock
                                size={14}
                                className="landing-page-text opacity-75"
                              />
                              <span className="text-xs landing-page-text opacity-75">
                                {t("reply") || "Reply"}: {formData.responseTime}
                                {t("min") || "m"}
                              </span>
                            </div>
                          )}
                      </div>

                      {formData.showCity && (
                        <div className="f fwn aic g5">
                          <MapPin
                            size={14}
                            className="ml5 miw20 mih20 landing-page-text opacity-75"
                          />
                          <span className="text-xs landing-page-text">
                            {visitorCity
                              ? `${
                                  t("youAreIn") || "You are in"
                                } ${visitorCity}`
                              : `${t("youAreNear") || "You are near"}`}
                            {formData.distanceFromVisitor ? (
                              <span className="ml-1">
                                , {t("weAreOnly") || "we are only"}{" "}
                                {formData.distanceFromVisitor}{" "}
                                {t("miles") || "mi"} {t("away") || "away"}!
                              </span>
                            ) : (
                              <span className="ml-1">
                                , {t("weAreOnly") || "we are only"} x{" "}
                                {t("miles") || "mi"} {t("away") || "away"}!
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                    </div>

                    {formData.bio && (
                      <div className="px15 Bio landing-page-text">
                        <RichTextContent
                          content={formData.bio}
                          className="landing-page-text italic fz14"
                        />
                      </div>
                    )}
                  </div>

                  {/* Display Promotion section - moved outside social links conditional */}
                  {formData.promotion && (
                    <div className="my-2 fc g5 aic px15 promotion-element">
                      <div className="f aic g5 jcc wrap">
                        <span
                          className="text-sm font-semibold landing-page-text promotion-text"
                          style={{
                            color: ensureValidHexColor(
                              formData.promotionTextColor
                            ),
                          }}
                        >
                          {formData.promotion}
                        </span>
                        {formData.promotionEndsIn && (
                          <PromotionCountdown
                            endsAt={formData.promotionEndsIn}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  <div className="fc g15 py15 px15">
                    {/* Display links with a key based on refreshTrigger to force re-render */}
                    {formData.landingPageId &&
                      !loading &&
                      socialLinks.length > 0 && (
                        <>
                          <div className="overflow-visible">
                            <SocialMediaLinksDisplay
                              key={`social-display-${
                                typeof refreshTrigger === "object"
                                  ? refreshTrigger.count
                                  : refreshTrigger
                              }`}
                              userId={mongoUser?._id}
                              landingPageId={formData.landingPageId}
                              showUpdateLink={false}
                              links={socialLinks.filter(
                                (link) => link.platform !== "other"
                              )}
                              className="!oh mt10 wf SocialLinkNoAnimation"
                              showTitle={true}
                              horizontalScrollClassName="mxa wfc overflow-visible"
                              buttonClassName="PreviewButton landing-page-button whitespace-nowrap overflow-hidden text-ellipsis flex items-center"
                              iconSize={iconSize}
                              onlyIcon={formData?.socialIconsType === "type2"}
                              hideIcons={false}
                              useLinkLabel={true}
                            />
                          </div>

                          {/* Other links with custom component */}
                          {hasOtherLinks && (
                            <div className="fc g10 mt15 wf overflow-visible">
                              <OtherLinksDisplay
                                key={`other-display-${
                                  typeof refreshTrigger === "object"
                                    ? refreshTrigger.count
                                    : refreshTrigger
                                }`}
                                links={socialLinks}
                                buttonClassName="PreviewButton landing-page-button whitespace-nowrap overflow-hidden text-ellipsis flex items-center"
                                iconSize={iconSize}
                                hideIcons={formData?.disableLinkLogos}
                              />
                            </div>
                          )}
                        </>
                      )}

                    {formData.landingPageId &&
                      !loading &&
                      socialLinks.length === 0 && (
                        <div className="py20 tac text-foreground fsi fz12 mb15">
                          {t("noSocialLinksAddedYet") ||
                            "No social links added yet"}
                        </div>
                      )}

                    {formData.landingPageId && loading && (
                      <div className="py20 tac text-foreground fsi fz12 mb15">
                        {t("loadingSocialLinks") || "Loading social links..."}
                      </div>
                    )}

                    {!formData.landingPageId && (
                      <div className="py20 tac text-foreground fsi fz12 mb15">
                        {t("socialLinksWillAppearAfterSaving") ||
                          "Social links will appear here after saving the landing page"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default AddLandingPageFormPreview;
