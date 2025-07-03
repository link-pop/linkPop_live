"use client";

import { ExternalLink, Pencil } from "lucide-react";
import HorizontalScroll from "@/components/ui/shared/HorizontalScroll/HorizontalScroll";
import Link from "next/link";
import { SOCIAL_MEDIA_ROUTE } from "@/lib/utils/constants";
import TrackableSocialMediaLink from "./TrackableSocialMediaLink";
import {
  platformIcons,
  platformUrls,
  allPlatforms,
} from "@/lib/data/platformData";
import { getLinkDisplayUrl } from "@/lib/utils/linkProtection";

export default function SocialMediaLinksDisplay({
  links = [],
  className = "",
  showTitle = false,
  showUpdateLink = false,
  mode = null,
  horizontalScrollClassName = "",
  buttonClassName = "",
  iconSize = 16,
  onlyIcon = false,
  hideIcons = false,
  useLinkLabel = false,
}) {
  // Make sure links is always an array to prevent runtime errors
  const linksArray = Array.isArray(links) ? links : [];

  // Filter links based on mode
  const filteredLinks =
    mode === "other"
      ? linksArray.filter((link) => link.platform === "other")
      : mode === null
      ? linksArray.filter((link) => link.platform !== "other")
      : linksArray;

  // If no social media links after filtering, don't render anything
  if (!filteredLinks || !filteredLinks.length) return null;

  // Get link URL - now uses the secure protection system
  const getLinkUrl = (link) => {
    return getLinkDisplayUrl(link);
  };

  return (
    <div className="min-[600px]:!maw600 max-[600px]:wfc mxa overflow-hidden">
      <HorizontalScroll
        className={`flex maw600 items-center gap-2 ${horizontalScrollClassName}`}
      >
        <div className="flex items-center gap-2 flex-nowrap min-w-max">
          {showUpdateLink && (
            <Link
              className="fcc miw40 mih40 bw1 br50 flex-shrink-0"
              href={SOCIAL_MEDIA_ROUTE}
            >
              <Pencil className="w16 h16 cp" />
            </Link>
          )}
          {filteredLinks.map((link) => {
            const platform = allPlatforms.find(
              (p) => p.value === link.platform
            );
            const url = getLinkUrl(link);
            return (
              <TrackableSocialMediaLink
                key={link._id || link.id}
                href={url}
                linkId={link._id || link.id}
                className={`f aic g5 p5 overflow-visible ${
                  onlyIcon
                    ? "px5 fcc"
                    : "px10 br20 hover:opacity-80 cp flex-shrink-0 " +
                      (buttonClassName
                        ? buttonClassName
                        : "bg-accent text-accent-foreground")
                }`}
                title={
                  showTitle
                    ? `${link.label}: ${
                        link.platform === "other"
                          ? link.websiteUrl
                          : "@" + link.username
                      }`
                    : undefined
                }
              >
                {platform && !hideIcons && (
                  <platform.icon
                    size={iconSize}
                    className={
                      (onlyIcon ? "text-foreground" : "flex-shrink-0") +
                      " transition-transform duration-200 hover:scale-125"
                    }
                  />
                )}
                {!onlyIcon && link.platform !== "other" && (
                  <span>
                    {useLinkLabel && link.label ? link.label : platform?.label}
                  </span>
                )}
                {!onlyIcon && link.platform === "other" && link.label && (
                  <span>{link.label}</span>
                )}
              </TrackableSocialMediaLink>
            );
          })}
        </div>
      </HorizontalScroll>
    </div>
  );
}
