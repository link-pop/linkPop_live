"use client";

import ChatroomFullPost from "@/components/Post/Post/Full/Custom/ChatroomFullPost";
import useLayoutWidth from "@/hooks/useLayoutWidth";

// * Component to show messages for a specific chatroom
export default function ChatroomMessages({
  chatroom,
  mongoUser,
  isAdmin,
  searchQuery,
}) {
  useLayoutWidth("1000");

  if (!chatroom) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-sm font-style-italic opacity-30">
        <div className="title text-center">Chatroom not found</div>
      </div>
    );
  }

  return (
    // Right side - Exact chatroom messages
    <div className="flex-1 flex flex-col min-h-0">
      <ChatroomFullPost
        post={chatroom}
        isAdmin={isAdmin}
        mongoUser={mongoUser}
        searchQuery={searchQuery}
      />
    </div>
  );
}
