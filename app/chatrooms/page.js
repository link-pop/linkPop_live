import ChatroomsEmptyState from "@/components/Chatrooms/ChatroomsEmptyState";
import ChatroomsListServer from "@/components/Chatrooms/ChatroomsListServer";
import PostsLoader from "@/components/Post/Posts/PostsLoader";
import { Suspense } from "react";

// * chatrooms main page - shows empty state when no chat selected
export default async function ChatroomsPage({ searchParams }) {
  return (
    <div className="flex h-full w-full">
      {/* Left side - Chatrooms list with search support */}
      <div className="LeftChatroomPart w-[400px] max-w-[400px] flex-shrink-0 border-r">
        <Suspense fallback={<PostsLoader isLoading={true} />}>
          <ChatroomsListServer searchParams={searchParams} />
        </Suspense>
      </div>

      {/* Right side - Empty state */}
      <ChatroomsEmptyState postsFoundNum={1} />
    </div>
  );
}
