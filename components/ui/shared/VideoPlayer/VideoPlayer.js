"use client";

import React from "react";
import { cn } from "@/lib/utils";

const VideoPlayer = ({ url, className, thumbnail }) => {
  const isYouTubeUrl = url?.includes("youtube.com") || url?.includes("youtu.be");
  
  const getYouTubeEmbedUrl = (url) => {
    if (url?.includes("youtube.com")) {
      const videoId = url.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    } else if (url?.includes("youtu.be")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  return (
    <div className={cn("relative w-full aspect-video rounded-lg overflow-hidden", className)}>
      {isYouTubeUrl ? (
        <iframe
          className="w-full h-full"
          src={getYouTubeEmbedUrl(url)}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <video
          className="w-full h-full object-cover"
          controls
          preload="metadata"
          poster={thumbnail}
        >
          <source src={url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
};

export default VideoPlayer;
