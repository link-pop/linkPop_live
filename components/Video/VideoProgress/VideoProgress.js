"use client";

import { useState, useEffect } from "react";

export default function VideoProgress({ videoRef, isActive }) {
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const video = videoRef?.current;
    if (!video || !isActive) return;

    const updateProgress = () => {
      if (video.duration) {
        const progressPercent = (video.currentTime / video.duration) * 100;
        setProgress(progressPercent);
      }
    };

    const updateDuration = () => {
      setDuration(video.duration);
    };

    video.addEventListener("timeupdate", updateProgress);
    video.addEventListener("loadedmetadata", updateDuration);
    video.addEventListener("durationchange", updateDuration);

    return () => {
      video.removeEventListener("timeupdate", updateProgress);
      video.removeEventListener("loadedmetadata", updateDuration);
      video.removeEventListener("durationchange", updateDuration);
    };
  }, [videoRef, isActive]);

  if (!isActive || duration === 0) return null;

  return (
    <div className="poa b0 l0 r0 h-1 bg-white/20">
      <div
        className="h-full bg-white transition-all duration-100"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
