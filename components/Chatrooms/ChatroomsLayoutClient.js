"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ChatroomsRedirect from "./ChatroomsRedirect";

// * Client component to handle responsive layout and redirects
export default function ChatroomsLayoutClient({ children }) {
  const pathname = usePathname();
  const isSpecificChat = pathname !== "/chatrooms";
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // Apply mobile hiding logic to the parent layout
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
