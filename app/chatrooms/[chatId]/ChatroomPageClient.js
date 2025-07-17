"use client";

import { useEffect } from "react";
import ChatroomMessages from "@/components/Chatrooms/ChatroomMessages";
import { useChatSearch } from "@/contexts/ChatSearchContext";

export default function ChatroomPageClient({
  chatroom,
  mongoUser,
  isAdmin,
  chatroomsListComponent,
}) {
  const { chatSearchQuery, setCurrentChatroom } = useChatSearch();

  // Set the current chatroom in context when component mounts
  useEffect(() => {
    setCurrentChatroom(chatroom);

    // Cleanup when unmounting
    return () => {
      setCurrentChatroom(null);
    };
  }, [chatroom, setCurrentChatroom]);

  return (
    <div className="flex h-full w-full">
      {/* Left side - Chatrooms list */}
      <div className="w-[400px] max-w-[400px] flex-shrink-0 border-r LeftChatroomPart">
        {chatroomsListComponent}
      </div>

      {/* Right side - Chat messages with search */}
      <ChatroomMessages
        chatroom={chatroom}
        mongoUser={mongoUser}
        isAdmin={isAdmin}
        searchQuery={chatSearchQuery}
      />
    </div>
  );
}
