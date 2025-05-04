"use client";

import { Image, Video } from "lucide-react";

export default function ChatmessagePostFileCount({ files, isOwnMessage }) {
  if (!files?.length) return null;

  // Count images and videos
  const fileCount = files.reduce(
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

  if (fileCount.images === 0 && fileCount.videos === 0) return null;

  return (
    <div
      className={`pt15 f g10 mb-2 ${
        isOwnMessage ? "text-foreground" : "text-foreground"
      }`}
    >
      {fileCount.images > 0 && (
        <div className="f g5 aic">
          <Image className="w-4 h-4" />
          <span className="fz12">{fileCount.images}</span>
        </div>
      )}
      {fileCount.videos > 0 && (
        <div className="f g5 aic">
          <Video className="w-4 h-4" />
          <span className="fz12">{fileCount.videos}</span>
        </div>
      )}
    </div>
  );
}
