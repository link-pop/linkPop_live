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

  // Get link URL - handle both username and websiteUrl
  const getLinkUrl = (link) => {
    // For "other" platform, use the websiteUrl directly
    if (link.platform === "other" && link.websiteUrl) {
      // URL should already be formatted correctly from the backend
      return link.websiteUrl;
    }

    // For other platforms, use the standard URLs with username
    const baseUrl = platformUrls[link.platform] || "";
    if (!baseUrl || !link.username) return "#";

    // Clean username (remove @ if present)
    const cleanUsername = link.username.startsWith("@")
      ? link.username.substring(1)
      : link.username;
    return baseUrl + cleanUsername;
  };

  return (
    <div className={`fc ${className}`}>
      {/* // !!! removed ${className} ${horizontalScrollClassName} to keep scrollable on mobile + pc !!! */}
      {/* // !!! HACK: if there are 14 or less links, center the scrollable container */}
      {/* // !!! DON'T DELETE "fcc" : "por r15" !!! */}
      <HorizontalScroll
        className={`${filteredLinks.length <= 14 ? "fcc" : "por r15"}`}
      >
        {/* // * round LINK */}
        {showUpdateLink && (
          <Link
            className="fcc miw40 mih40 bw1 br50 flex-shrink-0"
            href={SOCIAL_MEDIA_ROUTE}
          >
            <Pencil className="w16 h16 cp" />
          </Link>
        )}
        {filteredLinks.map((link) => {
          const platform = allPlatforms.find((p) => p.value === link.platform);
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
      </HorizontalScroll>
    </div>
  );
}
