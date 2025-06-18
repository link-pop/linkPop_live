"use client";

import { useTranslation } from "@/components/Context/TranslationContext";
import { formatPrice } from "@/lib/utils/formatPrice";
import AddToUserCartButton from "@/components/ui/shared/AddToUserCartButton/AddToUserCartButton";

export default function StoreItemRegularContentOverlay({
  content,
  mongoUser,
  className = "",
  variant = "default", // "default" | "fullscreen"
}) {
  const { t } = useTranslation();

  if (!content) return null;

  const { title, text, price, category, storeItem } = content;

  // Default overlay for card/carousel view
  if (variant === "default") {
    return (
      <div
        className={`poa t0 bg-background/50 f jcsb wf px10 py5 ${className}`}
      >
        {/* Title */}
        {title && <h3 className="text-lg fw500 text-foreground/80">{title}</h3>}

        {price > 0 && (
          <div className="text-lg fw500 text-foreground/80">
            {formatPrice(price)}
          </div>
        )}
      </div>
    );
  }

  // Fullscreen overlay for ImageViewer
  if (variant === "fullscreen") {
    return (
      <div
        className={`poa b0 l0 r0 bg-gradient-to-t from-black/90 via-black/60 to-transparent text-white p20 max-h-[40vh] overflow-y-auto ${className}`}
      >
        {/* Title */}
        {title && (
          <h2 className="text-xl font-bold mb10 line-clamp-2">{title}</h2>
        )}

        {/* Description */}
        {text && (
          <div
            className="maw450 wf text-sm mb15 line-clamp-4 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: text }}
          />
        )}

        {/* Price and Cart Button - Show for logged in users */}
        {storeItem && price > 0 && mongoUser?._id && (
          <AddToUserCartButton
            storeItem={storeItem}
            mongoUser={mongoUser}
            showPrice={true}
            variant="default"
            className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
          />
        )}

        {/* Price and login prompt for non-logged-in users */}
        {storeItem && price > 0 && !mongoUser?._id && (
          <div className="wfc fc g10">
            <div className="text-lg font-bold bg-accent text-accent-foreground px15 py8 rounded-lg inline-block">
              {formatPrice(price)}
            </div>
            <div className="bad text-sm text-white/80">
              Sign in to add to cart
            </div>
          </div>
        )}

        {/* Fallback price display for non-store items */}
        {!storeItem && price > 0 && (
          <div className="text-lg font-bold bg-accent text-accent-foreground px15 py8 rounded-lg inline-block">
            {formatPrice(price)}
          </div>
        )}
      </div>
    );
  }

  return null;
}
