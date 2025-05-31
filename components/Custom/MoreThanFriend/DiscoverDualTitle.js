"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "@/components/Context/TranslationContext";
import {
  DISCOVER_VIDEO_ROUTE,
  DISCOVER_SEARCH_ROUTE,
  DISCOVER_MEDIA_ROUTE,
} from "@/lib/utils/constants";

const DiscoverDualTitle = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();

  const isDiscoverActive = pathname.includes(DISCOVER_VIDEO_ROUTE);
  const isSearchActive = pathname.includes(DISCOVER_SEARCH_ROUTE);
  const isMediaActive = pathname.includes(DISCOVER_MEDIA_ROUTE);

  const handleDiscoverClick = () => {
    router.push(DISCOVER_VIDEO_ROUTE);
  };

  const handleSearchClick = () => {
    router.push(DISCOVER_SEARCH_ROUTE);
  };

  const handleMediaClick = () => {
    router.push(DISCOVER_MEDIA_ROUTE);
  };

  return (
    <div className="f g8">
      <div
        className={`cursor-pointer transition-all ${
          isDiscoverActive
            ? "text-foreground font-semibold"
            : "text-muted-foreground hover:text-foreground"
        }`}
        onClick={handleDiscoverClick}
      >
        {t("discover").toUpperCase()}
      </div>
      <div className="text-muted-foreground">|</div>
      <div
        className={`cursor-pointer transition-all ${
          isSearchActive
            ? "text-foreground font-semibold"
            : "text-muted-foreground hover:text-foreground"
        }`}
        onClick={handleSearchClick}
      >
        {t("search").toUpperCase()}
      </div>
      <div className="text-muted-foreground">|</div>
      <div
        className={`cursor-pointer transition-all ${
          isMediaActive
            ? "text-foreground font-semibold"
            : "text-muted-foreground hover:text-foreground"
        }`}
        onClick={handleMediaClick}
      >
        {t("media").toUpperCase()}
      </div>
    </div>
  );
};

export default DiscoverDualTitle;
