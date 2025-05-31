"use client";

import { Volume2, VolumeX } from "lucide-react";

/**
 * Reusable video sound control component
 * @param {boolean} isMuted - Whether the video is currently muted
 * @param {function} onToggle - Function to call when toggling mute state
 * @param {string} className - Additional CSS classes
 * @param {number} size - Icon size (default: 20)
 */
export default function VideoSoundControl({
  isMuted,
  onToggle,
  className = "",
  size = 20,
}) {
  return (
    <button
      onClick={onToggle}
      className={`w-12 h-12 br50 bg-black/50 fcc text-white hover:bg-black/70 transition-colors ${className}`}
      title={isMuted ? "Unmute" : "Mute"}
    >
      {isMuted ? <VolumeX size={size} /> : <Volume2 size={size} />}
    </button>
  );
}
