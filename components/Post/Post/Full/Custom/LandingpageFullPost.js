"use client";

import { useState, useEffect } from "react";
import FullPost from "../FullPost";
import ProfileImages from "@/app/my/settings/profile/ProfileImages";
import UserFullPostAnalyticsLink from "./UserFullPostAnalyticsLink";
import LandingPageEditLink from "./LandingPageEditLink";
import RichTextContent from "@/components/ui/shared/RichTextContent/RichTextContent";
import { useTranslation } from "@/components/Context/TranslationContext";
import SocialMediaLinksDisplay from "@/components/ui/shared/SocialMediaLinks/SocialMediaLinksDisplay";
import OtherLinksDisplay from "@/components/ui/shared/SocialMediaLinks/OtherLinksDisplay";
import { getSocialMediaLinks } from "@/lib/actions/getSocialMediaLinks";
import useLandingPageCustomization from "@/hooks/useLandingPageCustomization";
import { Clock, MapPin, Share2 } from "lucide-react";
import Script from "next/script";
import Logo from "@/components/Nav/Header/Logo";
import { useFacebookPixel, FacebookPixelScript } from "@/lib/utils/fbPixel";
import { useContext } from "@/components/Context/Context";
import RoundIconButton from "@/components/ui/shared/RoundIconButton/RoundIconButton";
import useShareHelper from "@/components/ui/shared/Share/ShareHelper";
import { fetchGeoData } from "@/lib/utils/fetchGeoData";
import ShareModal from "@/components/ui/shared/Share/ShareModal";
import PromotionCountdown from "@/components/ui/shared/PromotionCountdown/PromotionCountdown";
import ShowCityIndicator from "@/components/Post/AddPostCustom/LinkPop/ShowCityIndicator";
import ShowOnlineAndResponseTime from "@/components/Post/AddPostCustom/LinkPop/ShowOnlineAndResponseTime";
import LandingPageNameAndUsername from "@/components/ui/shared/LandingPageNameAndUsername";

export default function LandingpageFullPost({ post, col, isAdmin, mongoUser }) {
  const { t } = useTranslation();
  const { toastSet } = useContext();
  const [socialLinks, setSocialLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { shareContent, shareModalState, closeShareModal } = useShareHelper();
  const [visitorCity, setVisitorCity] = useState("");

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

  // Use our custom Facebook Pixel hook
  const fbPixelLoaded = useFacebookPixel(post?.facebookPixelId);

  // Handle page sharing using our reusable sharing utility
  const handleSharePage = () => {
    const pageUrl = window.location.href;
    const pageTitle = post?.name || post?.displayName || "Check out my page";

    shareContent({
      url: pageUrl,
      title: pageTitle,
    });
  };

  // Apply customization colors using the new hook
  useLandingPageCustomization({
    id: post?._id || "default",
    textColor: post?.textColor,
    bgColor: post?.bgColor,
    buttonTextColor: post?.buttonTextColor,
    buttonBgColor: post?.buttonBgColor,
    buttonRoundness: post?.buttonRoundness,
    buttonAnimation: post?.buttonAnimation,
    buttonShadow: post?.buttonShadow,
    shadowColor: post?.shadowColor,
    fontFamily: post?.fontFamily,
    textFontSize: post?.textFontSize,
    buttonFontSize: post?.buttonFontSize,
    socialIconsType: post?.socialIconsType,
    textShadow: post?.textShadow,
    textShadowColor: post?.textShadowColor,
    showOnline: post?.showOnline,
    showCity: post?.showCity,
    responseTime: post?.responseTime,
    promotion: post?.promotion,
    promotionTextColor: post?.promotionTextColor,
    promotionEndsIn: post?.promotionEndsIn,
    distanceFromVisitor: post?.distanceFromVisitor,
    disableLinkLogos: post?.disableLinkLogos,
    isPreview: false,
  });

  // Using landingPageId for fetching social links for SITE2
  useEffect(() => {
    let isMounted = true;

    const fetchSocialLinks = async () => {
      if (!post?._id) return;

      try {
        // For landing pages, pass both userId and landingPageId
        // getSocialMediaLinks will determine which to use based on SITE1/SITE2
        const links = await getSocialMediaLinks(
          post.createdBy?._id || post.createdBy,
          post._id
        );

        if (isMounted) {
          setSocialLinks(links || []);
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch social links:", error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSocialLinks();

    return () => {
      isMounted = false;
    };
  }, [post?._id, post.createdBy]);

  if (!post) return null;

  // Check if landing page is active
  if (!post.active && !isAdmin) {
    return (
      <div className="fc jcc aic p40 maw600 mxa">
        <h1 className="fz24 mb20">{t("pageNotAvailable")}</h1>
        <p>{t("landingPageInactive")}</p>
        <div className="mt-10 fc aic jcc">
          <Logo height="30px" />
        </div>
      </div>
    );
  }

  // Check if current user is the landing page owner
  const isOwner =
    mongoUser &&
    (mongoUser._id.toString() ===
      (post.createdBy?._id || post.createdBy).toString() ||
      isAdmin);

  // Format landing page data to be compatible with ProfileImages component
  const adaptedLandingPage = {
    ...post,
    profileImage: post.profileImage,
    coverImage: post.coverImage,
    name: post.name,
    isOwner: isOwner,
  };

  // ! changing coverImage and profileImage position for landing page
  useEffect(() => {
    const coverImage = document.querySelector(".CoverImage");
    const profileImage = document.querySelector(".ProfileImage");
    coverImage?.classList.add("pof", "t0", "l0", "wf", "hf");
    profileImage?.classList.add("!por", "!t0", "!l0", "!wfc", "mxa");

    return () => {
      coverImage?.classList.remove("pof", "t0", "l0", "wf", "hf");
      profileImage?.classList.remove("!por", "!t0", "!l0", "!wfc", "mxa");
    };
  }, []);
  // ? changing coverImage and profileImage position for landing page

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
    post?.buttonFontSize || "medium",
    post?.socialIconsType === "type2"
  );

  return (
    <>
      {/* Use our FacebookPixelScript component */}
      {post?.facebookPixelId && (
        <FacebookPixelScript pixelId={post.facebookPixelId} />
      )}

      {/* Add CSS to remove transitions from social links */}
      <style jsx global>{`
        .SocialLinkNoAnimation a:not(.OtherLinkButton) {
          transition: none !important;
          animation: none !important;
        }
      `}</style>

      <FullPost
        {...{
          post,
          col,
          isAdmin,
          mongoUser,
        }}
        showAutoGenMongoFields={false}
        skipCustom={true}
        showFiles={false}
        showCreatedAt={false}
        showCreatedAtTimeAgo={false}
        showTags={false}
        className={`!maw600 mxa LandingPage-${post._id}`}
        top={
          <ProfileImages
            mongoUser={mongoUser}
            visitedMongoUser={adaptedLandingPage}
            isLandingPage={true}
            customBgColor={post.bgColor || null}
          />
        }
        top2={
          <div className="wbba fc g10 tac py15">
            <LandingPageNameAndUsername
              name={
                post.name ||
                post.displayName ||
                (post.createdBy &&
                  (post.createdBy.displayName || post.createdBy.name))
              }
              username={post.username}
            />

            {/* Display Online and City indicators */}
            <div className="fc aic jcc g10">
              {/* Group Online status and response time together in a single flex container */}
              <ShowOnlineAndResponseTime
                showOnline={post.showOnline}
                responseTime={post.responseTime}
                t={t}
              />
            </div>

            {/* Location indicator with fixed layout */}
            {post.showCity && (
              <div className="tac mb15">
                <ShowCityIndicator
                  city={visitorCity}
                  distance={post.distanceFromVisitor}
                  t={t}
                />
              </div>
            )}

            {post.bio && (
              <div className="px15 Bio landing-page-text">
                <RichTextContent
                  content={post.bio}
                  className="landing-page-text italic fz14"
                />
              </div>
            )}
          </div>
        }
        top3={
          <div className="fc g15 overflow-visible">
            {/* Display Promotion section - moved outside social links conditional */}
            {post.promotion && (
              <div className="my-2 fc g5 aic px15 promotion-element overflow-visible">
                <PromotionCountdown
                  endsAt={post.promotionEndsIn}
                  promotion={post.promotion}
                  promotionTextColor={post.promotionTextColor}
                />
              </div>
            )}

            {/* Regular social media links */}
            <SocialMediaLinksDisplay
              key={`social-display-${refreshTrigger}`}
              userId={post.createdBy?._id || post.createdBy}
              landingPageId={post._id}
              showUpdateLink={false}
              links={socialLinks.filter((link) => link.platform !== "other")}
              className="!px10 !oh mt10 ml3 SocialLinkNoAnimation"
              showTitle={true}
              horizontalScrollClassName={`mxa wfc overflow-visible`}
              buttonClassName={`LandingPageButton landing-page-button whitespace-nowrap overflow-hidden text-ellipsis flex items-center`}
              iconSize={iconSize}
              onlyIcon={post?.socialIconsType === "type2"}
              hideIcons={false}
              useLinkLabel={true}
            />

            {/* Other links with new custom component */}
            {hasOtherLinks && (
              <div className="fc g10 mt15 px15 overflow-visible">
                <OtherLinksDisplay
                  key={`other-display-${refreshTrigger}`}
                  links={socialLinks}
                  buttonClassName={`LandingPageButton landing-page-button whitespace-nowrap overflow-hidden text-ellipsis flex items-center`}
                  iconSize={iconSize}
                  hideIcons={post?.disableLinkLogos}
                />
              </div>
            )}
          </div>
        }
        top5={
          <div>
            {/* Share whole page button */}
            <RoundIconButton
              className="poa t15 r115"
              onClick={handleSharePage}
              title={t("sharePage") || "Share this page"}
              extraClasses="bg-background/80 hover:bg-background/90 shadow-sm hover:shadow transition-all"
            >
              <Share2 size={18} className="" />
            </RoundIconButton>

            {isOwner && (
              <>
                <UserFullPostAnalyticsLink
                  visitedMongoUser={adaptedLandingPage}
                  isLandingPage={true}
                  landingPageId={post._id}
                />
                <LandingPageEditLink landingPageId={post._id} />
              </>
            )}
          </div>
        }
        top6={
          <div className="px15 py7 br20 bg-accent/40 fixed bottom-0 cx mb15 fc aic jcc">
            <Logo height="30px" />
          </div>
        }
      />

      {/* Render ShareModal component */}
      <ShareModal
        isOpen={shareModalState.isOpen}
        onClose={closeShareModal}
        url={shareModalState.url}
        title={shareModalState.title}
        text={shareModalState.text}
        image={post?.profileImage}
      />
    </>
  );
}
