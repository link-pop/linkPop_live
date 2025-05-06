"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { useState, useRef, useEffect } from "react";
import {
  ADMIN_CLICKS_ROUTE,
  LOGIN_ROUTE,
  MENU_CLASS,
  ORDERS_ROUTE,
  SETTINGS_ROUTE,
} from "@/lib/utils/constants";
import Link from "next/link";
import { Button } from "../ui/button";
import {
  EyeOff,
  HeartOff,
  LogOut,
  Settings,
  ShoppingBag,
  User,
  BarChart2,
} from "lucide-react";
import { ThemeToggle } from "../ui/shared/ThemeToggle/ThemeToggle";
import ThemeSettings from "../ui/shared/ThemeSettings/ThemeSettings";
import LanguageSelector from "../ui/shared/LanguageSelector/LanguageSelector";
import { useTranslation } from "@/components/Context/TranslationContext";
import { createPortal } from "react-dom";
import { SITE1, SITE2 } from "@/config/env";
import { useRouter } from "next/navigation";

export default function CustomUserMenu({
  isBurgerClickedSet,
  mongoUser,
  openMenuClassName = "",
  isMobile = false,
}) {
  const { signOut, openUserProfile } = useClerk();
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const { t } = useTranslation();
  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
    right: 0,
  });
  const [portalElement, setPortalElement] = useState(null);
  const [isHoveringButton, setIsHoveringButton] = useState(false);
  const [isHoveringMenu, setIsHoveringMenu] = useState(false);
  const hoverTimeoutRef = useRef(null);
  const router = useRouter();
  // Handle menu visibility based on hover states
  useEffect(() => {
    if (isHoveringButton || isHoveringMenu) {
      setIsOpen(true);
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }
    } else {
      hoverTimeoutRef.current = setTimeout(() => {
        setIsOpen(false);
        isBurgerClickedSet(false);
      }, 150); // Small delay to allow moving between button and menu
    }

    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, [isHoveringButton, isHoveringMenu, isBurgerClickedSet]);

  useEffect(() => {
    // Set portal element
    setPortalElement(document.body);

    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        isBurgerClickedSet(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, isBurgerClickedSet]);

  // Calculate position when menu opens
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      if (isMobile) {
        setMenuPosition({
          bottom: window.innerHeight - rect.top + 10,
          left: rect.left - 190,
        });
      } else {
        setMenuPosition({
          top: rect.bottom,
          left: rect.left,
        });
      }
    }
  }, [isOpen, isMobile]);

  const menuItems = [
    // ! KEEP THIS clerk settings
    // {
    //   label: "Manage account",
    //   onClick: () => {
    //     openUserProfile();
    //     setIsOpen(false);
    //     isBurgerClickedSet(false);
    //   },
    //   icon: <Settings />,
    // },
    ...(SITE1
      ? [
          {
            label: t("profile"),
            href: `/users/${mongoUser?.name}`,
            icon: <User />,
          },
          {
            label: t("settings"),
            href: SETTINGS_ROUTE,
            icon: <Settings />,
          },
        ]
      : []),
    // Admin menu item for admins only (always, regardless of SITE1/SITE2)
    ...(mongoUser?.isAdmin
      ? [
          {
            label: t("admin") || "Admin",
            href: ADMIN_CLICKS_ROUTE,
            icon: <BarChart2 className="" />,
          },
        ]
      : []),
    // {
    //   label: "Orders",
    //   href: ORDERS_ROUTE,
    //   icon: <ShoppingBag />,
    // },
    // {
    //   label: "Not viewed products",
    //   href: "/products?viewed=false",
    //   icon: <EyeOff />,
    // },
    // {
    //   label: "Not viewed articles",
    //   href: "/articles?viewed=false",
    //   icon: <EyeOff />,
    // },
    // {
    //   label: "Not liked products",
    //   href: "/products?liked=false",
    //   icon: <HeartOff />,
    // },
    // {
    //   label: "Not liked articles",
    //   href: "/articles?liked=false",
    //   icon: <HeartOff />,
    // },
    {
      label: t("signOut"),
      href: "#",
      onClick: (e) => {
        e.preventDefault();
        e.stopPropagation();

        // First remove visitorId from localStorage
        localStorage.removeItem("visitorId");

        // HACK: Redirect to login page to avoid redirect loop
        router.push(LOGIN_ROUTE);

        // Use the standard Clerk signOut with redirect
        setTimeout(() => {
          signOut({ redirectUrl: LOGIN_ROUTE });
        }, 1000);
      },
      icon: <LogOut />,
    },
  ];

  if (!user) return null;

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        onTouchEnd={() => {
          setIsOpen(!isOpen);
        }}
        onMouseEnter={() => {
          setIsHoveringButton(true);
          setIsHovering(true);
        }}
        onMouseLeave={() => {
          setIsHoveringButton(false);
          setIsHovering(false);
        }}
        className="!px0 py8 bg-background text-foreground f fwn aic gap8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 overflow-hidden"
      >
        {user.imageUrl && (
          <img
            src={user.imageUrl}
            alt="Profile"
            className="w-8 h-8 rounded-full flex-shrink-0"
          />
        )}
        {!isMobile && (
          <span
            className={`transition-all duration-300 ease-in-out whitespace-nowrap ${
              isHovering
                ? "max-w-[200px] opacity-100 pr15 transform-none"
                : "max-w-0 opacity-0 pr0 -translate-x-4"
            }`}
          >
            {user.fullName || user.emailAddresses[0].emailAddress}
          </span>
        )}
      </Button>

      {isOpen &&
        portalElement &&
        createPortal(
          <div
            ref={menuRef}
            onMouseEnter={() => setIsHoveringMenu(true)}
            onMouseLeave={() => setIsHoveringMenu(false)}
            style={{
              position: "fixed",
              zIndex: 9999999,
              ...menuPosition,
            }}
            className={`w-56 rounded-lg shadow-lg border border-border py-1 bg-background ${openMenuClassName}`}
          >
            <div className="px-4 py-2 border-b border-border">
              <div className="font-medium text-foreground">{user.fullName}</div>
              <div className="text-sm text-muted-foreground">
                {user.emailAddresses[0].emailAddress}
              </div>
            </div>

            <ThemeToggle />
            {SITE1 && <ThemeSettings />}
            <LanguageSelector isBurgerClickedSet={isBurgerClickedSet} />

            <div>
              {menuItems.map((item, index) =>
                item.href && !item.onClick ? (
                  <Link
                    key={index}
                    href={item.href}
                    className={`${MENU_CLASS}`}
                    onClick={() => {
                      setIsOpen(false);
                      isBurgerClickedSet && isBurgerClickedSet(false);
                    }}
                  >
                    <span className="">{item.icon}</span>
                    {item.label}
                  </Link>
                ) : item.href && item.onClick ? (
                  <Link
                    key={index}
                    href={item.href}
                    className={`${MENU_CLASS}`}
                    onClick={(e) => {
                      if (item.onClick) {
                        item.onClick(e);
                      }
                      // Don't close menu for signOut to allow the signOut function to complete
                      if (item.label !== t("signOut")) {
                        setIsOpen(false);
                        isBurgerClickedSet && isBurgerClickedSet(false);
                      }
                    }}
                  >
                    <span className="">{item.icon}</span>
                    {item.label}
                  </Link>
                ) : (
                  <div
                    key={index}
                    className={`${MENU_CLASS} cursor-pointer`}
                    onClick={(e) => {
                      // Call the item's onClick handler
                      if (item.onClick) {
                        item.onClick(e);
                      }

                      // Don't close menu for signOut to allow the signOut function to complete
                      if (item.label !== t("signOut")) {
                        setIsOpen(false);
                        isBurgerClickedSet && isBurgerClickedSet(false);
                      }
                    }}
                  >
                    <span className="">{item.icon}</span>
                    {item.label}
                  </div>
                )
              )}
            </div>
          </div>,
          portalElement
        )}
    </div>
  );
}
