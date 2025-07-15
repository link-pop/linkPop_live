export const dynamic = "force-dynamic";
import ChatroomMessages from "@/components/Chatrooms/ChatroomMessages";
import ChatroomsListServer from "@/components/Chatrooms/ChatroomsListServer";
import PostsLoader from "@/components/Post/Posts/PostsLoader";
import { getOne } from "@/lib/actions/crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import { redirect } from "next/navigation";
import { LOGIN_ROUTE } from "@/lib/utils/constants";
import { Suspense } from "react";
import ChatroomPageClient from "./ChatroomPageClient";

// * individual chatroom messages page
export default async function ChatroomPage({ params, searchParams }) {
  const { mongoUser, isAdmin } = await getMongoUser();
  if (!mongoUser) redirect(LOGIN_ROUTE);

  const chatroom = await getOne({
    col: "chatrooms",
    data: { _id: params.chatId },
  });

  if (!chatroom) {
    redirect("/chatrooms");
  }

  // Convert MongoDB objects to plain objects to avoid serialization issues
  const plainChatroom = JSON.parse(JSON.stringify(chatroom));
  const plainMongoUser = JSON.parse(JSON.stringify(mongoUser));

  return (
    <ChatroomPageClient
      chatroom={plainChatroom}
      mongoUser={plainMongoUser}
      isAdmin={isAdmin}
      chatroomsListComponent={
        <Suspense fallback={<PostsLoader isLoading={true} />}>
          <ChatroomsListServer searchParams={searchParams} />
        </Suspense>
      }
    />
  );
}
