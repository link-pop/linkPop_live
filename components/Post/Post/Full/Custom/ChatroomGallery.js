"use client";

import UserFullPostUserMedia from "./UserFullPostUserMedia";
import { X } from "lucide-react";
import { useTranslation } from "@/components/Context/TranslationContext";

export default function ChatroomGallery({ chat, mongoUser, isAdmin, onClose }) {
  const { t } = useTranslation();

  if (!chat) return null;

  // Create a visited user from chat participants for compatibility with UserFullPostUserMedia
  // For chat gallery, we show files from all participants
  const chatParticipant =
    chat.chatRoomUsers?.find((user) => user._id !== mongoUser?._id) ||
    chat.chatRoomUsers?.[0];

  return (
    <div className="w-full h-full flex flex-col bg-background">
      {/* Gallery content */}
      <div className="flex-1 overflow-auto">
        <ChatroomGalleryContent
          chat={chat}
          mongoUser={mongoUser}
          isAdmin={isAdmin}
          chatParticipant={chatParticipant}
        />
      </div>
    </div>
  );
}

// Separate component for the gallery content to handle chat-specific filtering
function ChatroomGalleryContent({ chat, mongoUser, isAdmin, chatParticipant }) {
  // We need to pass special props to UserFullPostUserMedia for chat gallery
  const galleryProps = {
    post: { _id: chatParticipant?._id }, // Fake post object for compatibility
    isAdmin,
    mongoUser,
    visitedMongoUser: chatParticipant,
    isOwner: false, // Never owner in chat gallery context
    isChatGallery: true, // Special flag to indicate this is chat gallery
    chatId: chat._id, // Pass chat ID for filtering
  };

  return <UserFullPostUserMedia {...galleryProps} />;
}
