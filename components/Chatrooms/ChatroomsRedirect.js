"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// * Component to redirect old chatroom URLs with chatId query parameter to new URL structure
export default function ChatroomsRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const chatId = searchParams.get("chatId");
    if (chatId) {
      // Redirect to new URL structure
      router.replace(`/chatrooms/${chatId}`);
    }
  }, [searchParams, router]);

  return null;
}
