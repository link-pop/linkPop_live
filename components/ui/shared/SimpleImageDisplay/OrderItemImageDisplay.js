"use client";

import { useState } from "react";
import Image from "next/image";
import { Package } from "lucide-react";

export default function OrderItemImageDisplay({
  item,
  size = 50,
  className = "",
  fallbackIcon: FallbackIcon = Package,
  fallbackIconSize = 20,
  alt,
}) {
  const [hasError, setHasError] = useState(false);

  // Get the first file URL from the order item
  const getImageUrl = () => {
    // For order items, check if storeItemId has populated files
    if (item?.storeItemId?.files?.[0]?.fileUrl) {
      return item.storeItemId.files[0].fileUrl;
    }
    // Fallback for direct file access (cart items)
    if (item?.files?.[0]?.fileUrl) {
      return item.files[0].fileUrl;
    }
    return null;
  };

  const imageUrl = getImageUrl();
  const altText =
    alt || item?.title || item?.storeItemId?.title || "Store item";

  const handleError = () => {
    setHasError(true);
  };

  return (
    <div
      className={`bg-muted rounded-lg overflow-hidden flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {imageUrl && !hasError ? (
        <Image
          src={imageUrl}
          alt={altText}
          width={size}
          height={size}
          className="w-full h-full object-cover"
          onError={handleError}
        />
      ) : (
        <div className="w-full h-full fcc">
          <FallbackIcon
            className="text-muted-foreground"
            size={fallbackIconSize}
          />
        </div>
      )}
    </div>
  );
}
