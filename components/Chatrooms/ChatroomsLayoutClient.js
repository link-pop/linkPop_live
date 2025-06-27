"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ChatroomsRedirect from "./ChatroomsRedirect";
import useChatRoomsUpdates from "@/hooks/useChatRoomsUpdates";
import {
  CHATROOMS_SEND_ROUTE,
  CHATROOMS_STATISTICS_ROUTE,
  CHATS_ROUTE,
} from "@/lib/utils/constants";
import useWindowWidth from "@/hooks/useWindowWidth";

// * Client component to handle responsive layout and redirects
export default function ChatroomsLayoutClient({ children }) {
  const pathname = usePathname();
  const isSpecificChat =
    pathname !== CHATS_ROUTE &&
    pathname !== CHATROOMS_SEND_ROUTE &&
    pathname !== CHATROOMS_STATISTICS_ROUTE;

  // Get chatId if we're in a specific chat room
  const chatId = isSpecificChat ? pathname.split("/")[2] : null;

  // Enable real-time updates for chatrooms
  useChatRoomsUpdates(chatId);
  const { isMobile } = useWindowWidth();

  // Apply mobile hiding logic to the parent layout
  // Only hide LeftChatroomPart on mobile when viewing a specific chat room
  // Always show it on send page and statistics page
  useEffect(() => {
    const leftChatroomPart = document.querySelector(".LeftChatroomPart");
    if (leftChatroomPart) {
      if (isSpecificChat && isMobile) {
        leftChatroomPart.style.display = "none";
        leftChatroomPart.style.width = "0px";
      } else {
        leftChatroomPart.style.display = "";
        leftChatroomPart.style.width = "";
      }
    }
  }, [isSpecificChat, isMobile]);

  return (
    <>
      <ChatroomsRedirect />
      {children}
    </>
  );
}
