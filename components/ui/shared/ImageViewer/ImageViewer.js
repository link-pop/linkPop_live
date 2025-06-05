"use client";

import { X } from "lucide-react";
import Image from "next/image";
import {
  Carousel,
  CarouselMainContainer,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { useState } from "react";
import { createPortal } from "react-dom";
import { formatPrice } from "@/lib/utils/formatPrice";
import { useTranslation } from "@/components/Context/TranslationContext";
import AddToUserCartButton from "@/components/ui/shared/AddToUserCartButton/AddToUserCartButton";

const MediaContent = ({ file, isZoomed, priority }) => {
  if (file.fileType === "video") {
    return (
      <video
        src={file.fileUrl}
        className={`w-full h-full object-contain`}
        controls
        autoPlay
        playsInline
      />
    );
  }

  return (
    <Image
      src={file.fileUrl}
      alt={`Fullscreen view`}
      fill
      className={`object-contain`}
      sizes="100vw"
      priority={priority}
    />
  );
};

const ContentOverlay = ({ content, isVisible, mongoUser }) => {
  const { t } = useTranslation();

  if (!content || !isVisible) return null;

  const { title, text, price, category, storeItem } = content;

  return (
    <div className="poa b0 l0 r0 bg-gradient-to-t from-black/90 via-black/60 to-transparent text-white p20 max-h-[40vh] overflow-y-auto">
      {/* Title */}
      {title && (
        <h2 className="text-xl font-bold mb10 line-clamp-2">{title}</h2>
      )}

      {/* Category */}
      {category && (
        <div className="text-sm opacity-90 uppercase tracking-wide mb10 bg-white/20 px10 py5 rounded-full inline-block">
          {category}
        </div>
      )}

      {/* Description */}
      {text && (
        <div
          className="text-sm mb15 line-clamp-4 leading-relaxed"
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
          className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
        />
      )}

      {/* Fallback price display for non-store items */}
      {!storeItem && price > 0 && (
        <div className="text-lg font-bold bg-accent text-accent-foreground px15 py8 rounded-lg inline-block">
          {formatPrice(price)}
        </div>
      )}
    </div>
  );
};

export default function ImageViewer({
  files,
  currentIndex,
  onClose,
  content = null,
  showContent = true,
  mongoUser = null,
}) {
  if (!files || currentIndex === null) return null;

  const [zoomedIndex, setZoomedIndex] = useState(null);
  const [showContentOverlay, setShowContentOverlay] = useState(showContent);

  const handleImageClick = (index, e) => {
    e.stopPropagation();
    // Only allow zoom for images
    if (files[index].fileType !== "video") {
      setZoomedIndex(zoomedIndex === index ? null : index);
    }
  };

  const resetZoom = (e) => {
    if (e) e.stopPropagation();
    setZoomedIndex(null);
  };

  const toggleContentOverlay = (e) => {
    e.stopPropagation();
    setShowContentOverlay(!showContentOverlay);
  };

  const portalContent = (
    <div
      className={`pof inset-0 bg-black/90 z-[99999] f aic jcc`}
      style={{ zIndex: 2147483647 }}
      onClick={onClose}
    >
      <div
        className={`por w-full h-full f aic jcc p15`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <div
          className={`poa t15 r15 p10 rf bg-black/50 hover:bg-black/70 cp z10`}
          onClick={onClose}
        >
          <X className={`w24 h24 white`} />
        </div>

        {/* Content toggle button */}
        {content && (
          <div
            className={`poa t15 l15 p10 rf bg-black/50 hover:bg-black/70 cp z10 text-white text-sm`}
            onClick={toggleContentOverlay}
          >
            {showContentOverlay ? "Hide Info" : "Show Info"}
          </div>
        )}

        <div className={`w-full h-full max-w-[100vw] oh por`}>
          <Carousel
            className={`w-full h-full`}
            showThumbnails={false}
            showIndicators={false}
            showArrows={files.length > 1}
            infinite={true}
            defaultIndex={currentIndex}
            carouselOptions={{
              align: "center",
              containScroll: false,
              dragFree: false,
              startIndex: currentIndex,
            }}
          >
            <CarouselMainContainer className={`w-full`}>
              {files.map((file, index) => (
                <div
                  key={index}
                  className={`scrollbar-hide por h-[100dvh] w-full shrink-0 grow-0 basis-full f aic jcc ${
                    file.fileType !== "video" ? "cp" : ""
                  } oa`}
                  onClick={(e) => handleImageClick(index, e)}
                >
                  <div
                    className={`por w-full h-full transition-transform duration-300`}
                    style={{
                      transform:
                        zoomedIndex === index ? "scale(2)" : "scale(1)",
                      transformOrigin: "top",
                    }}
                  >
                    <MediaContent
                      file={file}
                      isZoomed={zoomedIndex === index}
                      priority={index === currentIndex}
                    />
                  </div>
                </div>
              ))}
            </CarouselMainContainer>

            <div className={`poa inset-0 f aic jcb p15 pointer-events-none`}>
              <div className={`pointer-events-auto`}>
                <div onClick={resetZoom} className={`dib`}>
                  <CarouselPrevious
                    className={`bg-black/50 hover:bg-black/70 white`}
                  />
                </div>
              </div>
              <div className={`pointer-events-auto`}>
                <div onClick={resetZoom} className={`dib`}>
                  <CarouselNext
                    className={`bg-black/50 hover:bg-black/70 white`}
                  />
                </div>
              </div>
            </div>
          </Carousel>

          {/* Content overlay */}
          <ContentOverlay
            content={content}
            isVisible={showContentOverlay}
            mongoUser={mongoUser}
          />
        </div>
      </div>
    </div>
  );

  return typeof window !== "undefined"
    ? createPortal(portalContent, document.body)
    : null;
}
