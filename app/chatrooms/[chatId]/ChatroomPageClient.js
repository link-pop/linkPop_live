"use client";

import ChatroomMessages from "@/components/Chatrooms/ChatroomMessages";
import { useChatSearch } from "@/contexts/ChatSearchContext";

export default function ChatroomPageClient({
  chatroom,
  mongoUser,
  isAdmin,
  chatroomsListComponent,
}) {
  const { chatSearchQuery } = useChatSearch();

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
