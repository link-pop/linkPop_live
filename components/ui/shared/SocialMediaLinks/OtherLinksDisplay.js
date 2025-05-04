"use client";

import { ExternalLink, Share2 } from "lucide-react";
import TrackableSocialMediaLink from "./TrackableSocialMediaLink";
import useShareHelper from "../Share/ShareHelper";

export default function OtherLinksDisplay({
  links = [],
  className = "",
  buttonClassName = "",
  iconSize = 16,
  hideIcons = false,
}) {
  // Get the shareContent function from our reusable hook
  const { shareContent } = useShareHelper();

  // Make sure links is always an array to prevent runtime errors
  const linksArray = Array.isArray(links) ? links : [];

  // Filter to only show "other" links
  const otherLinks = linksArray.filter((link) => link.platform === "other");

  // If no other links, don't render anything
  if (!otherLinks || !otherLinks.length) return null;

  // Share link handler using our reusable sharing utility
  const handleShare = (event, url, label) => {
    event.preventDefault();
    event.stopPropagation();

    shareContent({
      url,
      title: label || "Check out this link",
      onError: () => {
        // Fallback to opening the link directly if sharing fails
        window.open(url, "_blank");
      },
    });
  };

  return (
    <div className={`maw500 wf mxa fcc g10 overflow-visible ${className}`}>
      {otherLinks.map((link) => (
        <TrackableSocialMediaLink
          key={link._id || link.id}
          href={link.websiteUrl}
          linkId={link._id || link.id}
          className={`f aic jcsb wf py15 px20 br15 hover:opacity-80 transition-all group cp overflow-visible OtherLinkButton ${buttonClassName}`}
        >
          <div className="f fwn aic g10">
            {!hideIcons && (
              <ExternalLink
                size={iconSize}
                className="group-hover:text-brand transition-colors"
              />
            )}
            <span className="fz16 fw600">{link.label}</span>
          </div>
          <div
            className="share-button"
            onClick={(e) => handleShare(e, link.websiteUrl, link.label)}
          >
            <Share2
              size={iconSize}
              className="group-hover:text-brand transition-colors"
            />
          </div>
        </TrackableSocialMediaLink>
      ))}
    </div>
  );
}
