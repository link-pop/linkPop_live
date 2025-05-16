"use client";

import { useSearchParams } from "next/navigation";
import ContentTypeSwitch from "./ContentTypeSwitch";
import QueuedPosts from "./QueuedPosts";
import QueuedMessages from "./QueuedMessages";
import { useState, useEffect } from "react";
import QueuedPreview from "./QueuedPreview";
import { useContext } from "@/components/Context/Context";

export default function QueueContent({ mongoUser }) {
  const searchParams = useSearchParams();
  const contentType = searchParams.get("contentType") || "posts";
  const { dialogSet } = useContext();

  // State for selected item and type
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile on client side
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Reset selected item and type when content type changes
  useEffect(() => {
    setSelectedItem(null);
    setSelectedType(null);
  }, [contentType]);

  // Handler for selecting an item
  const handleSelectItem = (item, type) => {
    setSelectedItem(item);
    setSelectedType(type);

    // On mobile, show preview in a dialog
    if (isMobile) {
      dialogSet({
        isOpen: true,
        hasCloseIcon: true,
        title: type === "feeds" ? "Post Preview" : "Message Preview",
        comp: (
          <div className="w-full px-2 py-4">
            <QueuedPreview
              item={item}
              type={type}
              mongoUser={mongoUser}
              inDialog={true}
            />
          </div>
        ),
        contentClassName: "p0 max-w-[90vw] maw450 mx-auto",
        showBtns: false,
      });
    }
  };

  return (
    <div className="maw1000 wf mxa pt15 px15 fc md:fr g20">
      <div className="wf flex-shrink-0">
        <ContentTypeSwitch mongoUser={mongoUser} />
      </div>

      <div className="flex-1">
        {contentType === "posts" ? (
          <QueuedPosts
            mongoUser={mongoUser}
            onSelect={handleSelectItem}
            selectedItem={selectedItem}
          />
        ) : (
          <QueuedMessages
            mongoUser={mongoUser}
            onSelect={handleSelectItem}
            selectedItem={selectedItem}
          />
        )}
      </div>

      {/* Preview panel (right side) - only on desktop */}
      <div className="border-l maw400 wf md:block hidden sticky top-[70px] self-start h-[calc(100dvh-100px)]">
        <QueuedPreview
          item={selectedItem}
          type={
            selectedType || (contentType === "posts" ? "feeds" : "chatmessages")
          }
          mongoUser={mongoUser}
        />
      </div>
    </div>
  );
}
