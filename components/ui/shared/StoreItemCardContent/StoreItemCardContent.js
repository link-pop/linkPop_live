"use client";

import Carousel from "../Carousel/Carousel";
import StoreItemRegularContentOverlay from "../ContentOverlay/StoreItemRegularContentOverlay";
import StoreItemAuctionContentOverlay from "../ContentOverlay/StoreItemAuctionContentOverlay";
import { useTranslation } from "@/components/Context/TranslationContext";
import { Image } from "lucide-react";

export default function StoreItemCardContent({
  files = [],
  content = {},
  className = "",
  showContent = true,
  contentClassName = "",
  mongoUser = null,
  customOverlay = null,
  customContent = null,
  ...carouselProps
}) {
  const { t } = useTranslation();

  const isAuctionItem =
    content?.type === "auction" || content?.storeItem?.type === "auction";

  const renderPlaceholder = () => {
    return (
      <div className="aspect-square bg-muted fcc border rounded-lg">
        <Image className="w40 h40 text-muted-foreground" />
      </div>
    );
  };

  const contentOverlay = showContent
    ? customOverlay ||
      (isAuctionItem ? (
        <StoreItemAuctionContentOverlay
          content={content}
          mongoUser={mongoUser}
          variant="default"
          className={contentClassName}
        />
      ) : (
        <StoreItemRegularContentOverlay
          content={content}
          mongoUser={mongoUser}
          variant="default"
          className={contentClassName}
        />
      ))
    : null;

  return (
    <div className={`por ${className}`}>
      <div className="por flex-shrink-0">
        {files.length > 0 ? (
          <Carousel
            className=""
            files={files}
            content={content}
            showContentInViewer={showContent}
            mongoUser={mongoUser}
            contentOverlay={contentOverlay}
            {...carouselProps}
          />
        ) : (
          renderPlaceholder()
        )}
      </div>

      {customContent && <div className="wf">{customContent}</div>}
    </div>
  );
}
