"use client";

import { createContext, useContext, useState } from "react";

const ChatSearchContext = createContext();

export function ChatSearchProvider({ children }) {
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);

  const handleChatMessageSearch = (searchQuery) => {
    setChatSearchQuery(searchQuery);
  };

  const togglePinnedMode = () => {
    setShowPinnedOnly((prev) => !prev);
  };

  const exitPinnedMode = () => {
    setShowPinnedOnly(false);
  };

  return (
    <ChatSearchContext.Provider
      value={{
        chatSearchQuery,
        handleChatMessageSearch,
        showPinnedOnly,
        togglePinnedMode,
        exitPinnedMode,
      }}
    >
      {children}
    </ChatSearchContext.Provider>
  );
}

export function useChatSearch() {
  return useContext(ChatSearchContext);
}
