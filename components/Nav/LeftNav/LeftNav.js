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

export default function LeftNav({ mongoUser }) {
  const pathname = usePathname();
  const { isMobile } = useWindowWidth();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  useLayoutWidth();
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const [showLabels, setShowLabels] = useState(false);
  const expandTimeoutRef = useRef(null);
  const collapseTimeoutRef = useRef(null);
  const collapseDelayRef = useRef(null);

  // Handle hover effects with delay for text labels and animations
  useEffect(() => {
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
  }, [isNavExpanded]);

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
    if (isMobile) return;
    setIsNavExpanded(true);
  };

  const handleMouseLeave = () => {
    if (isMobile) return;

    // Delay the collapse animation
    collapseDelayRef.current = setTimeout(() => {
      setIsNavExpanded(false);
    }, 200); // Increased delay before starting to collapse
  };

  return (
    <nav
      className={`LeftNav ${!isMobile ? "t10" : ""} fixed z-50 ${
        isMobile
          ? "bottom-0 left-0 w-full flex flex-row justify-around items-center py-3 px-2 border-t"
          : `fc g8 ${
              isNavExpanded ? "w-64" : "w-16"
            } p-2 transition-all duration-500 ease-in-out left-0 top-0 h-screen sticky border-r border-border/30`
      } bg-background`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {!isMobile && (
        <div className={`fc g8 wf ${isNavExpanded ? "" : "items-center"}`}>
          <SignedOut>
            <Link
              href={LOGIN_ROUTE}
              className={`f fwn g8 p10 wf rounded-md transition-all duration-300 ease-in-out hover:bg-muted ${
                isNavExpanded ? "" : "fcc"
              } overflow-hidden`}
            >
              <div className="text-xl flex-shrink-0">
                <LogIn className="w-6 h-6" />
              </div>
              <span
                className={`transition-all duration-300 ease-in-out whitespace-nowrap ${
                  isNavExpanded
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
            <ClerkSignInButton
              openMenuClassName="left-0"
              className={`${isNavExpanded ? "mra ml8" : "mx-auto"}`}
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
            isExpanded={isNavExpanded}
            showLabels={showLabels}
          />
          {SITE2 ? null : (
            <LeftNavNewPostBtn1
              isMobile={false}
              isExpanded={isNavExpanded}
              showLabels={showLabels}
            />
          )}
        </>
      )}
    </nav>
  );
}
