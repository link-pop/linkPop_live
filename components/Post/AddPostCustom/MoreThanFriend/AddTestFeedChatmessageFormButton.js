"use client";

import { add } from "@/lib/actions/crud";
import { useContext } from "@/components/Context/Context";
import { useSearchParams } from "next/navigation";

export default function AddTestFeedChatmessageFormButton({ mongoUser, col }) {
  const { toastSet } = useContext();
  const searchParams = useSearchParams();
  const chatRoomId = searchParams.get("chatId");

  const handleCreateTestPosts = async () => {
    if (!mongoUser?._id) return;

    try {
      // First create a test chat room
      // const chatRoom = await add({
      //   col: "chatrooms",
      //   data: {
      //     chatRoomUsers: [mongoUser._id],
      //   },
      //   revalidate: "/feeds",
      // });

      // if (!chatRoom?._id) {
      //   throw new Error("Failed to create chat room");
      // }

      // Create 100 test messages in the chat room
      const testPosts = Array.from({ length: 100 }, (_, i) => ({
        chatRoomId: chatRoomId,
        createdBy: mongoUser._id,
        chatMsgText: `Test post ${i + 1} - ${new Date().toISOString()}`,
        files: [],
        expirationPeriod: null,
        scheduleAt: null,
      }));

      for (const post of testPosts) {
        await add({
          col,
          data: post,
          revalidate: "/feeds",
        });
      }

      toastSet({
        isOpen: true,
        title: "100 test posts created successfully",
      });
    } catch (error) {
      console.error("Error creating test posts:", error);
      toastSet({
        isOpen: true,
        title: "Error creating test posts",
        text: error?.message || "An unexpected error occurred",
      });
    }
  };

  return (
    <div
      onClick={handleCreateTestPosts}
      className={`f aic jcc h40 w40 br50p hov-op8 cp`}
      title="Create 100 test posts"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="M12 18v-6" />
        <path d="M9 15h6" />
      </svg>
    </div>
  );
}
