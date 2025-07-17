"use client";

import { createContext, useContext, useState } from "react";

const ChatSearchContext = createContext();

export function ChatSearchProvider({ children }) {
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const [showGallery, setShowGallery] = useState(false);

  const handleChatMessageSearch = (searchQuery) => {
    setChatSearchQuery(searchQuery);
  };

  const togglePinnedMode = () => {
    setShowPinnedOnly((prev) => {
      const newShowPinnedOnly = !prev;
      if (newShowPinnedOnly) {
        setShowGallery(false);
      }
      return newShowPinnedOnly;
    });
  };

  const exitPinnedMode = () => {
    setShowPinnedOnly(false);
  };

  const toggleGallery = () => {
    setShowGallery((prev) => {
      const newShowGallery = !prev;
      if (newShowGallery) {
        setShowPinnedOnly(false);
      }
      return newShowGallery;
    });
  };

  const exitGallery = () => {
    setShowGallery(false);
  };

  return (
    <ChatSearchContext.Provider
      value={{
        chatSearchQuery,
        handleChatMessageSearch,
        showPinnedOnly,
        togglePinnedMode,
        exitPinnedMode,
        showGallery,
        toggleGallery,
        exitGallery,
      }}
    >
      {children}
    </ChatSearchContext.Provider>
  );
}

export function useChatSearch() {
  return useContext(ChatSearchContext);
}
