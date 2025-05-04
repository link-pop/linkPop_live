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
} from "@/lib/utils/constants";
import { ArrowLeft } from "lucide-react";
import { CHATS_ROUTE } from "../../../lib/utils/constants";
import { SITE1, SITE2 } from "@/config/env";

const PageTitle = () => {
  if (SITE2) return;

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  console.log("Pathname:", pathname);
  let title;

  if (pathname === MAIN_ROUTE) {
    title = t("home");
  } else if (pathname === ADD_FEED_ROUTE) {
    title = t("newPost");
  } else if (pathname.includes(UPDATE_FEED_ROUTE)) {
    title = t("editPost");
  } else if (pathname === FEEDS_ROUTE) {
    title = t("feed");
  } else if (pathname.includes("/users/")) {
    title = t("profile");
  } else if (pathname.includes("/feeds/")) {
    title = t("post");
  } else if (pathname.includes(CHATS_ROUTE)) {
    if (!searchParams.get("chatId")) {
      title = t("messages");
    }
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
  }

  // if (!title) return null;
  const router = useRouter();
  const width = pathname.includes(CHATS_ROUTE) ? "maw1000" : "maw600";

  // TODO !!!!! FIX z indexes in whole app
  return (
    <div
      className={`z50 sticky t0 h60 ${width} wf bg-background wf f aic p15 border-[1px]`}
    >
      <ArrowLeft
        className="cursor-pointer mr-2 hs"
        onClick={() => router.back()}
      />
      <div className="title">{title?.toUpperCase()}</div>
    </div>
  );
};

export default PageTitle;
