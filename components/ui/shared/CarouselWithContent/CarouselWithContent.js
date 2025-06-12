"use client";

import Carousel from "../Carousel/Carousel";
import { formatPrice } from "@/lib/utils/formatPrice";
import { useTranslation } from "@/components/Context/TranslationContext";
import { Image } from "lucide-react";
import AddToUserCartButton from "@/components/ui/shared/AddToUserCartButton/AddToUserCartButton";
import RichTextContent from "@/components/ui/shared/RichTextContent/RichTextContent";

export default function CarouselWithContent({
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
      <div className={`por p15 bg-background ${contentClassName}`}>
        {/* Title */}
        {title && (
          <h3 className="text-lg font-semibold text-foreground mb10">
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
          <div className="text-sm text-foreground mb10">
            <RichTextContent content={text} />
          </div>
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
