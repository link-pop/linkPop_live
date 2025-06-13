"use client";

import Carousel from "../Carousel/Carousel";
import { formatPrice } from "@/lib/utils/formatPrice";
import { useTranslation } from "@/components/Context/TranslationContext";
import { Image } from "lucide-react";

export default function StoreItemCardContent({
  files = [],
  content = {},
  className = "",
  showContent = true,
  contentClassName = "",
  mongoUser = null,
  ...carouselProps
}) {
  const { t } = useTranslation();

  const { title, text, price, category, storeItem } = content;

  const renderContent = () => {
    if (!showContent) return null;

    return (
      <div className={`poa t0 bg-background/50 f jcsb wf px10 py5`}>
        {/* Title */}
        {title && <h3 className="text-lg fw500 text-foreground/80">{title}</h3>}

        {price > 0 && (
          <div className="text-lg fw500 text-foreground/80">
            {formatPrice(price)}
          </div>
        )}
      </div>
    );
  };

  const renderPlaceholder = () => {
    return (
      <div className="aspect-square bg-muted fcc border rounded-lg">
        <Image className="w40 h40 text-muted-foreground" />
      </div>
    );
  };

  return (
    <div className={`por ${className}`}>
      {/* Carousel or placeholder */}
      <div className="por flex-shrink-0">
        {files.length > 0 ? (
          <Carousel
            className=""
            files={files}
            content={content}
            showContentInViewer={showContent}
            mongoUser={mongoUser}
            {...carouselProps}
          />
        ) : (
          renderPlaceholder()
        )}
      </div>

      {renderContent()}
    </div>
  );
}
