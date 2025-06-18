"use client";

import { X } from "lucide-react";
import Image from "next/image";
import {
  Carousel,
  CarouselMainContainer,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { useState, cloneElement } from "react";
import { createPortal } from "react-dom";
import StoreItemRegularContentOverlay from "../ContentOverlay/StoreItemRegularContentOverlay";
import StoreItemAuctionContentOverlay from "../ContentOverlay/StoreItemAuctionContentOverlay";

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

export default function ImageViewer({
  files,
  currentIndex,
  onClose,
  content = null,
  showContent = true,
  mongoUser = null,
  contentOverlay = null,
}) {
  if (!files || currentIndex === null) return null;

  const [zoomedIndex, setZoomedIndex] = useState(null);

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

  // Create fullscreen version of the contentOverlay if provided
  const fullscreenOverlay =
    contentOverlay && showContent
      ? cloneElement(contentOverlay, {
          variant: "fullscreen",
          className: "", // Reset className for fullscreen
        })
      : null;

  // Determine if this is an auction item
  const isAuctionItem =
    content?.type === "auction" || content?.storeItem?.type === "auction";

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

          {/* Content overlay - use passed contentOverlay or render appropriate overlay */}
          {fullscreenOverlay ||
            (showContent && isAuctionItem && (
              <StoreItemAuctionContentOverlay
                content={content}
                mongoUser={mongoUser}
                variant="fullscreen"
              />
            )) ||
            (showContent && !isAuctionItem && (
              <StoreItemRegularContentOverlay
                content={content}
                mongoUser={mongoUser}
                variant="fullscreen"
              />
            ))}
        </div>
      </div>
    </div>
  );

  return typeof window !== "undefined"
    ? createPortal(portalContent, document.body)
    : null;
}
