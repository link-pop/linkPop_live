"use client";

import { forwardRef, useRef, useEffect, useState } from "react";
import CreatedBy from "@/components/Post/Post/CreatedBy";
import VideoProgress from "../VideoProgress/VideoProgress";
import VideoSoundControl from "../VideoSoundControl/VideoSoundControl";
import { Play, Pause } from "lucide-react";
import usePageTitleHeight from "@/hooks/usePageTitleHeight";

const VideoFeedItem = forwardRef(
  ({ video, isActive, globalMuted, onGlobalMuteChange }, ref) => {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showControls, setShowControls] = useState(false);
    const pageTitleHeight = usePageTitleHeight();

    // Assign the video element to the ref passed from parent
    useEffect(() => {
      if (ref) {
        ref.current = videoRef.current;
      }
    }, [ref]);

    // Handle play/pause based on isActive
    useEffect(() => {
      const videoElement = videoRef.current;
      if (!videoElement) return;

      if (isActive) {
        // Set the muted state on the video element using global state
        videoElement.muted = globalMuted;
        videoElement
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(console.error);
      } else {
        videoElement.pause();
        setIsPlaying(false);
      }
    }, [isActive, globalMuted]);

    const togglePlayPause = () => {
      const videoElement = videoRef.current;
      if (!videoElement) return;

      if (isPlaying) {
        videoElement.pause();
        setIsPlaying(false);
      } else {
        videoElement
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(console.error);
      }
    };

    const toggleMute = () => {
      const videoElement = videoRef.current;
      if (!videoElement) return;

      const newMutedState = !globalMuted;
      videoElement.muted = newMutedState;
      onGlobalMuteChange(newMutedState);
    };

    const handleVideoClick = (e) => {
      // Only toggle play/pause if clicking on the video itself, not on controls
      if (e.target === videoRef.current) {
        togglePlayPause();
      }
    };

    // Calculate the height accounting for PageTitle
    const videoHeight =
      pageTitleHeight > 0 ? `calc(100dvh - ${pageTitleHeight}px)` : "100dvh";

    return (
      <div
        className={`w-full por flex-shrink-0 ${isActive ? "block" : "hidden"}`}
        style={{ height: videoHeight }}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        {/* Video */}
        <video
          ref={videoRef}
          src={video.fileUrl}
          className="w-full h-full object-cover cursor-pointer"
          loop
          muted={globalMuted}
          playsInline
          onClick={handleVideoClick}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

        {/* Video progress indicator */}
        <VideoProgress videoRef={videoRef} isActive={isActive} />

        {/* Overlay controls */}
        <div
          className={`poa inset-0 transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Play/Pause button in center */}
          <div className="poa c">
            <button
              onClick={togglePlayPause}
              className="w-16 h-16 br50 bg-black/50 fcc text-white hover:bg-black/70 transition-colors"
            >
              {isPlaying ? <Pause size={32} /> : <Play size={32} />}
            </button>
          </div>

          {/* Mute/Unmute button */}
          <div className="poa t20 r20">
            <VideoSoundControl isMuted={globalMuted} onToggle={toggleMute} />
          </div>
        </div>

        {/* Creator info overlay */}
        <div className="👋 poa b0 l0 r0">
          <div className="p-4">
            <CreatedBy
              createdBy={video.createdBy}
              className="text-white"
              nameClassName="text-white font-semibold"
              wrapClassName="hover:opacity-80 transition-opacity"
            />

            {/* Video metadata */}
            {video.tags && video.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {video.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-white/20 rounded-full text-white text-xs"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

VideoFeedItem.displayName = "VideoFeedItem";

export default VideoFeedItem;
