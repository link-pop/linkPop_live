"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import ChatroomsSendChatroomsList from "./ChatroomsSendChatroomsList";
import ChatroomsSendMessageForm from "./ChatroomsSendMessageForm";

// * Client component for mass message sending
export default function ChatroomsSendClient({ mongoUser, isAdmin }) {
  const searchParams = useSearchParams();
  const [selectedUsers, setSelectedUsers] = useState([]);

  const handleUserSelect = (user, isSelected) => {
    if (isSelected) {
      setSelectedUsers((prev) => [...prev, user]);
    } else {
      setSelectedUsers((prev) => prev.filter((u) => u._id !== user._id));
    }
  };

  const handleClearSelection = () => {
    setSelectedUsers([]);
  };

  return (
    <>
      {/* Left side - Users search and selection */}
      <div className="w-[400px] max-w-[400px] flex-shrink-0 border-r LeftChatroomPart">
        <ChatroomsSendChatroomsList
          mongoUser={mongoUser}
          isAdmin={isAdmin}
          searchParams={Object.fromEntries(searchParams)}
          selectedUsers={selectedUsers}
          onUserSelect={handleUserSelect}
        />
      </div>

      {/* Right side - Message composition */}
      <div className="flex-1 flex flex-col min-h-0">
        <ChatroomsSendMessageForm
          mongoUser={mongoUser}
          selectedUsers={selectedUsers}
          onClearSelection={handleClearSelection}
        />
      </div>
    </>
  );
}
