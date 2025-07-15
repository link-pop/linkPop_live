"use client";

import { createContext, useContext, useState } from "react";

const ChatSearchContext = createContext();

export function ChatSearchProvider({ children }) {
  const [chatSearchQuery, setChatSearchQuery] = useState("");

  const handleChatMessageSearch = (searchQuery) => {
    setChatSearchQuery(searchQuery);
  };

  return (
    <ChatSearchContext.Provider
      value={{ chatSearchQuery, handleChatMessageSearch }}
    >
      {children}
    </ChatSearchContext.Provider>
  );
}

export function useChatSearch() {
  return useContext(ChatSearchContext);
}
