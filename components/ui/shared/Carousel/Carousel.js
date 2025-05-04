"use client";

import {
  Carousel as _Carousel,
  CarouselMainContainer,
  CarouselThumbsContainer,
  SliderMainItem,
  SliderThumbItem,
  CarouselIndicator,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { useState, useRef, useMemo } from "react";
import ImageViewer from "../ImageViewer/ImageViewer";
import { Image, Video, Play } from "lucide-react";

const MediaContent = ({ file, className, style, isThumb = false }) => {
  const videoRef = useRef(null);

  // TODO !!!!! ??? DO I NEED THIS?
  // If fileUrl is null (unpurchased content), show a placeholder
  if (!file.fileUrl) {
    return (
      <div className={`por ${className} bg-muted fcc`} style={style}>
        {file.fileType === "video" ? (
          <Video className="w40 h40 text-muted-foreground" />
        ) : (
          <Image className="w40 h40 text-muted-foreground" />
        )}
      </div>
    );
  }

  if (file.fileType === "video") {
    return (
      <div className={`por ${className}`} style={style}>
        <video
          ref={videoRef}
          src={file.fileUrl}
          className={`w-full h-full object-cover`}
          controls={!isThumb}
          muted={isThumb}
          loop={isThumb}
          autoPlay={isThumb}
          playsInline
        />
        {isThumb && (
          <div className={`poa inset-0 bg-black/20 fcc`}>
            <Play className={`w20 h20 white`} />
          </div>
        )}
      </div>
    );
  }

  return (
    <img
      src={file.fileUrl}
      alt="Media content"
      className={className}
      style={style}
    />
  );
};

export default function Carousel({
  files = [],
  className = "",
  onClick,
  showThumbnails = true,
  showIndicators = true,
  showArrows = true,
  infinite = true,
  imageClassName = "object-cover rounded-md",
  thumbsClassName = "",
  aspectRatio = "aspect-square",
  imageSize = { width: 600, height: 600 },
  fileIcon = null,
}) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  // Count files by type
  const fileCounts = useMemo(() => {
    return files.reduce(
      (acc, file) => {
        if (file.fileType === "video") {
          acc.videos++;
        } else {
          acc.images++;
        }
        return acc;
      },
      { images: 0, videos: 0 }
    );
  }, [files]);

  // Default file icon if none provided
  const defaultFileIcon = (file) => {
    const showCounts = [];
    
    if (fileCounts.images > 0) {
      showCounts.push(
        <div key="images" className="f g5 aic">
          <Image className="w15 h15" />
          <span className="fz12">{fileCounts.images}</span>
        </div>
      );
    }
    
    if (fileCounts.videos > 0) {
      showCounts.push(
        <div key="videos" className="f g5 aic">
          <Video className="w15 h15" />
          <span className="fz12">{fileCounts.videos}</span>
        </div>
      );
    }

    return (
      <div className="poa b5 l5 bg-black/30 white px10 py5 br10 f aic g10">
        {showCounts}
      </div>
    );
  };

  if (files.length === 0) return null;

  return (
    <>
      <_Carousel
        className={`mx-auto por ${className}`}
        style={{ maxWidth: imageSize.width }}
        showThumbnails={showThumbnails}
        infinite={infinite}
        onClick={(index) => {
          if (typeof index === "number" && files[index]) {
            setSelectedImageIndex(index);
            onClick?.(index);
          }
        }}
      >
        <CarouselMainContainer style={{ maxWidth: imageSize.width }}>
          {files.map((file, index) => (
            <SliderMainItem key={index}>
              <div
                className={`por ${aspectRatio} group w-full cp`}
                style={{ maxWidth: imageSize.width }}
                onClick={() => {
                  setSelectedImageIndex(index);
                  onClick?.(index);
                }}
              >
                <MediaContent 
                  file={file}
                  className={`${imageClassName} w-full h-full`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    maxWidth: `${imageSize.width}px`,
                    maxHeight: `${imageSize.height}px`,
                  }}
                />
                {(fileIcon || defaultFileIcon)(file)}
              </div>
            </SliderMainItem>
          ))}
        </CarouselMainContainer>

        {showArrows && <CarouselPrevious />}
        {showIndicators && files.length > 1 && (
          <div className={`f g5 jcc mt10`}>
            {files.map((_, index) => (
              <CarouselIndicator key={index} index={index} />
            ))}
          </div>
        )}
        {showArrows && <CarouselNext />}

        {showThumbnails && files.length > 1 && (
          <CarouselThumbsContainer
            className={`w-full ${thumbsClassName}`}
            style={{ maxWidth: imageSize.width }}
          >
            {files.map((file, index) => (
              <SliderThumbItem key={index} index={index}>
                <div className={`por aspect-square w-full max-w-[80px]`}>
                  <MediaContent 
                    file={file}
                    className={`${imageClassName} w-full h-full`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      maxWidth: "80px",
                      maxHeight: "80px",
                    }}
                    isThumb={true}
                  />
                </div>
              </SliderThumbItem>
            ))}
          </CarouselThumbsContainer>
        )}
      </_Carousel>

      {selectedImageIndex !== null && (
        <ImageViewer
          files={files}
          currentIndex={selectedImageIndex}
          onClose={() => setSelectedImageIndex(null)}
        />
      )}
    </>
  );
}
