"use client";

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "@/components/Context/TranslationContext";
import {
  ADD_FEED_ROUTE,
  FEEDS_ROUTE,
  MAIN_ROUTE,
  NOTIFICATIONS_ROUTE,
  UPDATE_FEED_ROUTE,
  ONBOARDING_ROUTE,
  DISCOVER_VIDEO_ROUTE,
  DISCOVER_SEARCH_ROUTE,
  DISCOVER_MEDIA_ROUTE,
  CART_ROUTE,
  ORDERS_ROUTE,
  ADD_STOREITEM_ROUTE,
  AUCTION_PAYMENT_ROUTE,
  STOREITEMS_ROUTE,
} from "@/lib/utils/constants";
import { ArrowLeft } from "lucide-react";
import { CHATS_ROUTE } from "../../../lib/utils/constants";
import { SITE1, SITE2 } from "@/config/env";
import DiscoverDualTitle from "./DiscoverDualTitle";

const PageTitle = () => {
  if (SITE2) return;

  const pathname = usePathname();
  if (pathname?.startsWith(ONBOARDING_ROUTE)) return null;
  // Don't show PageTitle on chatrooms routes - MessagesTitle handles those
  if (pathname?.includes("/chatrooms")) return null;
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  console.log("Pathname:", pathname);
  let title;

  // Check if we're on discover routes to show dual title
  const isDiscoverRoute =
    pathname.includes(DISCOVER_VIDEO_ROUTE) ||
    pathname.includes(DISCOVER_SEARCH_ROUTE) ||
    pathname.includes(DISCOVER_MEDIA_ROUTE);

  if (pathname === MAIN_ROUTE) {
    title = t("home");
  } else if (pathname === ADD_FEED_ROUTE) {
    title = t("newPost");
  } else if (pathname.includes(UPDATE_FEED_ROUTE)) {
    title = t("editPost");
  } else if (pathname === FEEDS_ROUTE) {
    title = t("feed");
  } else if (pathname.includes("/feeds/")) {
    title = t("post");
  } else if (pathname.includes("/settings")) {
    // * SETTINGS
    // Get the path segments
    const segments = pathname.split("/").filter(Boolean);
    // If we're at /settings root, just show "Settings"
    if (segments.length === 1 || segments[segments.length - 1] === "settings") {
      title = t("settings");
    } else {
      // Get the last part for subpages
      const lastPart = segments[segments.length - 1];
      title = t("edit") + " " + t(lastPart);
    }
  } else if (pathname.includes(NOTIFICATIONS_ROUTE)) {
    title = t("notifications");
  } else if (pathname.includes("/analytics")) {
    title = t("analytics");
  } else if (pathname.includes("/my/queue")) {
    title = t("queue");
  } else if (pathname.includes(CART_ROUTE)) {
    title = t("cart");
  } else if (pathname.includes(ORDERS_ROUTE)) {
    title = t("orders");
  } else if (pathname.includes(ADD_STOREITEM_ROUTE)) {
    title = t("addStoreItem");
  } else if (pathname.includes(STOREITEMS_ROUTE)) {
    title = t("stores");
  } else if (pathname.includes(DISCOVER_SEARCH_ROUTE)) {
    // This will be handled by dual title
    title = null;
  } else if (pathname.includes(DISCOVER_VIDEO_ROUTE)) {
    // This will be handled by dual title
    title = null;
  } else if (pathname.includes(DISCOVER_MEDIA_ROUTE)) {
    // This will be handled by triple title
    title = null;
  } else if (pathname.includes(AUCTION_PAYMENT_ROUTE)) {
    title = t("auction") + " " + t("payment");
  } else if (pathname.match(/^\/[^\/]+$/)) {
    // ! MUST BE LAST
    title = t("profile");
  }

  // if (!title) return null;
  const router = useRouter();

  // Sync width logic with useLayoutWidth.js
  const isWiderPath =
    pathname?.includes("/settings") ||
    pathname?.includes("/chatrooms") ||
    pathname?.includes(CHATS_ROUTE) ||
    pathname?.includes("/analytics") ||
    pathname?.includes("/affiliate") ||
    pathname?.includes("/my/queue") ||
    pathname?.includes("/discover/search") ||
    pathname?.includes(CART_ROUTE) ||
    pathname?.includes(ORDERS_ROUTE) ||
    pathname?.includes(AUCTION_PAYMENT_ROUTE);

  const width = isWiderPath ? "maw1000" : "maw597";

  // TODO !!!!! FIX z indexes in whole app
  return (
    <div
      className={`mxa z50 sticky t0 h60 ${width} wf bg-background wf f aic p15 border-[1px]`}
    >
      <ArrowLeft
        className="cursor-pointer mr-2 hs"
        onClick={() => router.back()}
      />
      <div className="title">
        {isDiscoverRoute ? <DiscoverDualTitle /> : title?.toUpperCase()}
      </div>
    </div>
  );
};

export default PageTitle;
