"use client";

import ClerkSignInButton from "@/components/Clerk/ClerkSignInButton";
import { navItems } from "./leftNavItems";
import LeftNavNewPostBtn from "./LeftNavNewPostBtn";
import LeftNavNewLandingPageBtn from "./LeftNavNewLandingPageBtn";
import { usePathname, useSearchParams } from "next/navigation";
import { LOGIN_ROUTE, CHATS_ROUTE } from "@/lib/utils/constants";
import useWindowWidth from "../../../hooks/useWindowWidth";
import { getLinkHref, isActiveLink } from "./navUtils";
import MobileNavItems from "./MobileNavItems";
import DesktopNavItems from "./DesktopNavItems";
import useLayoutWidth from "@/hooks/useLayoutWidth";
import { SITE1, SITE2 } from "@/config/env";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { LogIn } from "lucide-react";
import LeftNavNewPostBtn1 from "./LeftNavNewPostBtn1";
import { useNavPosition } from "@/components/Context/NavPositionContext";

export default function LeftNav({ mongoUser }) {
  const pathname = usePathname();
  const { isMobile, windowWidth } = useWindowWidth();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const { isAttachedToContent, isExpandable } = useNavPosition();
  useLayoutWidth();
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const [showLabels, setShowLabels] = useState(false);
  const expandTimeoutRef = useRef(null);
  const collapseTimeoutRef = useRef(null);
  const collapseDelayRef = useRef(null);

  // Check if animation should be disabled (window width < 1900px)
  const isAnimationDisabled = windowWidth < 1900;

  // Handle hover effects with delay for text labels and animations
  useEffect(() => {
    // Always show labels when nav is not expandable
    if (!isExpandable) {
      setShowLabels(true);
      return;
    }

    // When width < 1900px, don't show labels by default
    if (isAnimationDisabled) {
      setShowLabels(false);
      return;
    }

    if (isNavExpanded) {
      // Clear any pending collapse timers
      if (collapseTimeoutRef.current) {
        clearTimeout(collapseTimeoutRef.current);
        collapseTimeoutRef.current = null;
      }
      if (collapseDelayRef.current) {
        clearTimeout(collapseDelayRef.current);
        collapseDelayRef.current = null;
      }

      // Set a timeout to show labels
      expandTimeoutRef.current = setTimeout(() => {
        setShowLabels(true);
      }, 250); // Increased timing for better synchronization with longer animation
    } else {
      // Delay the label hiding
      if (expandTimeoutRef.current) {
        clearTimeout(expandTimeoutRef.current);
        expandTimeoutRef.current = null;
      }

      // First hide the text labels
      collapseTimeoutRef.current = setTimeout(() => {
        setShowLabels(false);
      }, 250); // Increased timing to match longer animation
    }

    // Cleanup timeout on unmount or when dependencies change
    return () => {
      if (expandTimeoutRef.current) {
        clearTimeout(expandTimeoutRef.current);
        expandTimeoutRef.current = null;
      }
      if (collapseTimeoutRef.current) {
        clearTimeout(collapseTimeoutRef.current);
        collapseTimeoutRef.current = null;
      }
      if (collapseDelayRef.current) {
        clearTimeout(collapseDelayRef.current);
        collapseDelayRef.current = null;
      }
    };
  }, [isNavExpanded, isExpandable, isAnimationDisabled]);

  // Get base nav items
  const baseNavItems = navItems();

  const allNavItems = [...baseNavItems];

  const filteredNavItems = SITE2
    ? allNavItems.filter((item) => {
        const isIncluded = [
          "home",
          "dashboard",
          "directlinks",
          "landingpages",
          "pricing",
          "affiliate",
        ].includes(item.id);
        return isIncluded;
      })
    : isMobile
    ? allNavItems.filter((item) =>
        ["home", "notifications", "messages"].includes(item.id)
      )
    : allNavItems;

  if (pathname === LOGIN_ROUTE) return null;
  // don;t show in: /chatrooms?chatId=67b0c97c939cc37546aa2da5
  if (
    isMobile &&
    pathname.startsWith(CHATS_ROUTE) &&
    searchParams.get("chatId")
  )
    return null;

  const handleMouseEnter = () => {
    if (isMobile || !isExpandable || isAnimationDisabled) return;
    setIsNavExpanded(true);
  };

  const handleMouseLeave = () => {
    if (isMobile || !isExpandable || isAnimationDisabled) return;

    // Delay the collapse animation
    collapseDelayRef.current = setTimeout(() => {
      setIsNavExpanded(false);
    }, 200); // Increased delay before starting to collapse
  };

  // Determine if we should show the expanded nav
  // When animation is disabled, always show collapsed nav
  const shouldShowExpanded = isAnimationDisabled
    ? false
    : isExpandable
    ? isNavExpanded
    : true;

  return (
    <nav
      className={`LeftNav ${!isMobile ? "t10" : ""} fixed z-50 ${
        isMobile
          ? "bottom-0 left-0 w-full flex flex-row justify-around items-center py-3 px-2 border-t"
          : `fc g8 ${shouldShowExpanded ? "w-64" : "w-16"} p-2 transition-all ${
              isAnimationDisabled ? "" : "duration-500 ease-in-out"
            } ${
              isAttachedToContent ? "sticky" : "left-0"
            } top-0 h-screen border-r border-border/30`
      } bg-background`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ left: !isMobile && !isAttachedToContent ? "0" : undefined }}
    >
      {!isMobile && (
        <div className={`fc g8 wf ${shouldShowExpanded ? "" : "items-center"}`}>
          <SignedOut>
            <Link
              href={LOGIN_ROUTE}
              className={`f fwn g8 p10 wf rounded-md transition-all ${
                isAnimationDisabled ? "" : "duration-300 ease-in-out"
              } hover:bg-muted ${
                shouldShowExpanded ? "" : "fcc"
              } overflow-hidden`}
            >
              <div className="text-xl flex-shrink-0">
                <LogIn className="w-6 h-6" />
              </div>
              <span
                className={`transition-all ${
                  isAnimationDisabled ? "" : "duration-300 ease-in-out"
                } whitespace-nowrap ${
                  shouldShowExpanded
                    ? showLabels
                      ? "opacity-100 translate-x-0 max-w-[200px]"
                      : "opacity-0 -translate-x-4 max-w-0"
                    : "opacity-0 max-w-0"
                }`}
              >
                {t("login")}
              </span>
            </Link>
          </SignedOut>
          <SignedIn>
            {/* // desktop user image trace_1 */}
            {!isMobile && mongoUser.imageUrl && (
              <img
                src={mongoUser.imageUrl}
                alt="Profile"
                style={{
                  position: "absolute",
                  top: 5,
                  left: 15,
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            )}
            <ClerkSignInButton
              openMenuClassName="left-0"
              className={`${shouldShowExpanded ? "mra ml8" : "mx-auto"}`}
              mongoUser={mongoUser}
            />
          </SignedIn>
        </div>
      )}

      {isMobile ? (
        <MobileNavItems
          items={filteredNavItems}
          getLinkHref={getLinkHref}
          isActiveLink={(item) => isActiveLink(pathname, item, mongoUser)}
          mongoUser={mongoUser}
        />
      ) : (
        <>
          <DesktopNavItems
            items={filteredNavItems}
            getLinkHref={getLinkHref}
            isActiveLink={(item) => isActiveLink(pathname, item, mongoUser)}
            mongoUser={mongoUser}
            isExpanded={shouldShowExpanded}
            showLabels={showLabels}
          />
          {SITE2 ? null : (
            <LeftNavNewPostBtn1
              isMobile={false}
              isExpanded={shouldShowExpanded}
              showLabels={showLabels}
            />
          )}
        </>
      )}
    </nav>
  );
}
