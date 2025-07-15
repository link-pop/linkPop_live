"use client";

import ChatroomsLayout from "@/components/Chatrooms/ChatroomsLayout";
import { ChatSearchProvider } from "@/contexts/ChatSearchContext";

export default function ChatroomsLayoutPage({ children }) {
  return (
    <ChatSearchProvider>
      <ChatroomsLayout>{children}</ChatroomsLayout>
    </ChatSearchProvider>
  );
}
