"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getVideosForFeed } from "@/lib/actions/getVideosForFeed";

export function useVideoFeed() {
  const [videos, setVideos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [globalMuted, setGlobalMuted] = useState(false); // Global mute state
  const videoRefs = useRef([]);

  // Touch handling for mobile
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);

  // Fetch videos using the server action
  const fetchVideos = useCallback(async (skip = 0) => {
    try {
      const result = await getVideosForFeed({ skip, limit: 10 });

      if (result && result.length > 0) {
        if (skip === 0) {
          setVideos(result);
        } else {
          setVideos((prev) => [...prev, ...result]);
        }
        setHasMore(result.length === 10);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  // Auto-play current video and pause others
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === currentIndex) {
          video.play().catch(console.error);
        } else {
          video.pause();
        }
      }
    });
  }, [currentIndex]);

  const goToNext = useCallback(() => {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else if (hasMore) {
      // Load more videos
      fetchVideos(videos.length);
    }
  }, [currentIndex, videos.length, hasMore, fetchVideos]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const goToVideo = useCallback(
    (index) => {
      if (index >= 0 && index < videos.length) {
        setCurrentIndex(index);
      }
    },
    [videos.length]
  );

  // Touch handlers
  const handleTouchStart = useCallback((e) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(
    (e) => {
      touchEndY.current = e.changedTouches[0].clientY;
      const deltaY = touchStartY.current - touchEndY.current;
      const minSwipeDistance = 50;

      if (Math.abs(deltaY) > minSwipeDistance) {
        if (deltaY > 0) {
          // Swiped up - go to next video
          goToNext();
        } else {
          // Swiped down - go to previous video
          goToPrevious();
        }
      }
    },
    [goToNext, goToPrevious]
  );

  return {
    videos,
    currentIndex,
    loading,
    hasMore,
    videoRefs,
    globalMuted,
    setGlobalMuted,
    goToNext,
    goToPrevious,
    goToVideo,
    fetchVideos,
    handleTouchStart,
    handleTouchEnd,
  };
}
