"use client";

import { useState, useEffect, useRef } from "react";
import { emojiGroups } from "./emojiGroups"; // Assume this file contains categorized emoji data
import HorizontalScroll from "@/components/ui/shared/HorizontalScroll";

const defaultEmojis = [
  "😊",
  "😎",
  "😄",
  "😃",
  "😏",
  "😉",
  "😋",
  "😌",
  "😍",
  "😘",
  "😝",
  "😜",
  "🥳",
  "😇",
  "👿",
];

export default function AddEmoji({ onEmojiClick }) {
  const [activeGroup, setActiveGroup] = useState(Object.keys(emojiGroups)[0]);
  const [showMore, setShowMore] = useState(false);
  const moreEmojisRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        moreEmojisRef.current &&
        !moreEmojisRef.current.contains(event.target)
      ) {
        setShowMore(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={`wf flex flex-col gap-2 relative`}>
      {/* Default Emoji Row */}
      <HorizontalScroll className={`gap-1`}>
        <div
          onClick={() => setShowMore(!showMore)}
          className={`cursor-pointer hover:scale-125 transition-transform p-1 flex-shrink-0`}
        >
          ➕
        </div>
        {defaultEmojis.map((emoji, index) => (
          <div
            key={index}
            onClick={() => onEmojiClick(emoji)}
            className={`cursor-pointer hover:scale-125 transition-transform p-1 flex-shrink-0`}
          >
            {emoji}
          </div>
        ))}
      </HorizontalScroll>

      {/* More Emojis (Absolute Positioned) */}
      {showMore && (
        <div
          ref={moreEmojisRef}
          className={`absolute -t320 l0 mt-2 p-2 bg-background border shadow-md w-full z-10`}
        >
          <HorizontalScroll className={`gap-2 border-b pb-1`}>
            {Object.keys(emojiGroups).map((group) => (
              <div
                key={group}
                onClick={() => setActiveGroup(group)}
                onMouseOver={() => setActiveGroup(group)}
                className={`cp px-3 py-1 rounded-md transition-colors flex-shrink-0 ${
                  activeGroup === group
                    ? "bg-accent"
                    : "bg-accent/70 hover:bg-accent"
                }`}
              >
                {group}
              </div>
            ))}
          </HorizontalScroll>
          <div className={`h250 flex flex-wrap gap-1 mt-2 overflow-auto`}>
            {emojiGroups[activeGroup].map((emoji, index) => (
              <div
                key={index}
                onClick={() => onEmojiClick(emoji)}
                className={`cursor-pointer hover:scale-125 transition-transform p-1`}
              >
                {emoji}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
