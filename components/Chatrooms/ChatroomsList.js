"use client";

import PostsClientInfiniteScroll from "@/components/Post/Posts/PostsClientInfiniteScroll";

// * Chatrooms list component - shows all user's chatrooms (client component)
export default function ChatroomsList({
  col,
  mongoUser,
  isAdmin,
  data,
  searchParams = {},
}) {
  console.log("🔍 ChatroomsList - Received data:", data);
  console.log("🔍 ChatroomsList - Received searchParams:", searchParams);

  const limit = 8;

  return (
    <div className="fixed maw400 wf h-full w-full flex flex-col overflow-y-auto">
      <PostsClientInfiniteScroll
        data={data}
        searchParams={searchParams}
        col={col}
        isAdmin={isAdmin}
        postsPaginationType="infinite"
        limit={limit}
        mongoUser={mongoUser}
        className="w-full flex flex-col gap-0 my-0 container items-stretch"
      />
    </div>
  );
}
