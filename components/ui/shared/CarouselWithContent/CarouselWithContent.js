"use client";

import Carousel from "../Carousel/Carousel";
import { formatPrice } from "@/lib/utils/formatPrice";
import { useTranslation } from "@/components/Context/TranslationContext";
import { Image } from "lucide-react";
import AddToUserCartButton from "@/components/ui/shared/AddToUserCartButton/AddToUserCartButton";

export default function CarouselWithContent({
  files = [],
  content = {},
  className = "",
  showContent = true,
  contentPosition = "bottom", // "bottom", "top", "overlay"
  contentClassName = "",
  mongoUser = null,
  ...carouselProps
}) {
  const { t } = useTranslation();

  const { title, text, price, category, storeItem } = content;

  const renderContent = () => {
    if (!showContent) return null;

    return (
      <div className={`por p15 bg-background ${contentClassName}`}>
        {/* Title */}
        {title && (
          <h3 className="text-lg font-semibold text-foreground mb10 line-clamp-2">
            {title}
          </h3>
        )}

        {/* Category */}
        {category && (
          <div className="text-sm text-muted-foreground mb10 uppercase tracking-wide">
            {category}
          </div>
        )}

        {/* Description */}
        {text && (
          <div
            className="text-sm text-foreground mb10 line-clamp-3"
            dangerouslySetInnerHTML={{ __html: text }}
          />
        )}

        {/* Price and Cart Button */}
        {storeItem && price > 0 && (
          <AddToUserCartButton
            storeItem={storeItem}
            mongoUser={mongoUser}
            showPrice={true}
            variant="default"
          />
        )}

        {/* Fallback price display for non-store items */}
        {!storeItem && price > 0 && (
          <div className="text-lg font-bold text-foreground">
            {formatPrice(price)}
          </div>
        )}
      </div>
    );
  };

  const renderOverlayContent = () => {
    if (!showContent || contentPosition !== "overlay") return null;

    return (
      <div className="poa b0 l0 r0 bg-gradient-to-t from-black/80 to-transparent text-white p15">
        {/* Title */}
        {title && (
          <h3 className="text-lg font-semibold mb5 line-clamp-1">{title}</h3>
        )}

        {/* Category and Price/Cart Button */}
        <div className="por f jcsb aic">
          {category && (
            <div className="text-sm opacity-90 uppercase tracking-wide">
              {category}
            </div>
          )}

          {/* Price and Cart Button for store items */}
          {storeItem && price > 0 && (
            <AddToUserCartButton
              storeItem={storeItem}
              mongoUser={mongoUser}
              showPrice={true}
              variant="compact"
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
            />
          )}

          {/* Fallback price display for non-store items */}
          {!storeItem && price > 0 && (
            <div className="text-lg font-bold">{formatPrice(price)}</div>
          )}
        </div>
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
      {/* Top content */}
      {contentPosition === "top" && renderContent()}

      {/* Carousel with overlay content or placeholder */}
      <div className="por">
        {files.length > 0 ? (
          <>
            <Carousel
              files={files}
              content={content}
              showContentInViewer={showContent}
              mongoUser={mongoUser}
              {...carouselProps}
            />
            {renderOverlayContent()}
          </>
        ) : (
          renderPlaceholder()
        )}
      </div>

      {/* Bottom content */}
      {contentPosition === "bottom" && renderContent()}
    </div>
  );
}
