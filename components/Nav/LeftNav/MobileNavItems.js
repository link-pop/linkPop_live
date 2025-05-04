"use client";

import Link from "next/link";
import ClerkSignInButton from "@/components/Clerk/ClerkSignInButton";
import LeftNavNewPostBtn from "./LeftNavNewPostBtn";
import NotificationBadge from "@/components/ui/shared/NotificationBadge/NotificationBadge";
import { useEffect } from "react";
import { SITE2 } from "@/config/env";
import { useTranslation } from "@/components/Context/TranslationContext";

export default function MobileNavItems({
  items,
  getLinkHref,
  isActiveLink,
  mongoUser,
}) {
  // ! pb75 to prevent mobile menu from overlapping content
  useEffect(() => {
    document.body.classList.add("pb75");
    return () => {
      document.body.classList.remove("pb75");
    };
  }, []);

  const { t } = useTranslation();

  const renderMobileItems = () => {
    const mobileItems = [];

    // For SITE2, only show home and directlinks
    if (SITE2) {
      const home = items.find((item) => item.id === "home");
      const dashboard = items.find((item) => item.id === "dashboard");
      const directlinks = items.find((item) => item.id === "directlinks");
      if (home) mobileItems.push(home);
      if (dashboard) mobileItems.push(dashboard);
      if (directlinks) {
        mobileItems.push({ ...directlinks, name: t("links") });
      }

      // Add New Post button for SITE2
      // ! don't uncomment
      // mobileItems.push({
      //   id: "newpost",
      //   name: "NewPost",
      //   component: <LeftNavNewPostBtn isMobile={true} />,
      // });

      const landingpages = items.find((item) => item.id === "landingpages");
      if (landingpages) {
        mobileItems.push({ ...landingpages, name: t("pages") });
      }

      // Add pricing link for SITE2
      const pricing = items.find((item) => item.id === "pricing");
      if (pricing) mobileItems.push(pricing);

      // Add affiliate program link for SITE2
      const affiliate = items.find((item) => item.id === "affiliate");
      if (affiliate) {
        mobileItems.push({ ...affiliate, name: t("affiliateShort") });
      }

      // Add admin link for SITE2 (only shown if user is admin)
      const admin = items.find((item) => item.id === "admin");
      if (admin) mobileItems.push(admin);

      // Add sign in button for SITE2 as well
      mobileItems.push({
        id: "profile",
        name: "Profile",
        component: (
          <ClerkSignInButton
            isMobile={true}
            openMenuClassName="left-0"
            mongoUser={mongoUser}
          />
        ),
      });
    } else {
      mobileItems.push(items.find((item) => item.id === "home"));
      mobileItems.push(items.find((item) => item.id === "notifications"));
      mobileItems.push({
        id: "newpost",
        name: "NewPost",
        component: <LeftNavNewPostBtn isMobile={true} />,
      });
      mobileItems.push(items.find((item) => item.id === "messages"));

      // Add pricing link for SITE1
      const pricing = items.find((item) => item.id === "pricing");
      if (pricing) mobileItems.push(pricing);

      mobileItems.push({
        id: "profile",
        name: "Profile",
        component: (
          <ClerkSignInButton
            isMobile={true}
            openMenuClassName="left-0"
            mongoUser={mongoUser}
          />
        ),
      });
    }
    return mobileItems;
  };

  return renderMobileItems()
    .filter(Boolean)
    .map((item) =>
      item?.component ? (
        <div key={item.id}>{item.component}</div>
      ) : (
        <Link
          key={item.id}
          href={getLinkHref(item, mongoUser)}
          className={`flex flex-col items-center justify-center p-2 text-gray-500 hover:text-[var(--color-brand)] rounded-lg transition-colors ${
            isActiveLink(item) ? "brand" : ""
          }`}
        >
          <div className="flex">
            {item.icon}
            <NotificationBadge id={item.id} />
          </div>
          <span className="wsn !fz9 mt-1">{item.name.split(" ")[0]}</span>
        </Link>
      )
    );
}
