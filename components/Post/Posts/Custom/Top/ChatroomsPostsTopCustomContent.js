"use client";

import { usePathname } from "next/navigation";
import ChatroomsTypeSwitch from "../MoreThanFriend/ChatroomsTypeSwitch";
import { CHATS_ROUTE } from "@/lib/utils/constants";

export default function ChatroomsPostsTopCustomContent({ col, mongoUser }) {
  const pathname = usePathname();

  // Only show on chatrooms route
  if (!pathname.startsWith(CHATS_ROUTE)) return null;
  if (col.name !== "chatrooms") return null;

  return (
    <div className={`wf`}>
      <ChatroomsTypeSwitch {...{ mongoUser }} />
    </div>
  );
}
