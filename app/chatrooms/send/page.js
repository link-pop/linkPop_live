import ChatroomsSendClient from "@/components/Chatrooms/ChatroomsSendClient";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import { redirect } from "next/navigation";
import { LOGIN_ROUTE } from "@/lib/utils/constants";

// * Mass messages send page - allows sending messages to multiple users
export default async function ChatroomsSendPage() {
  const { mongoUser, isAdmin } = await getMongoUser();
  if (!mongoUser) redirect(LOGIN_ROUTE);

  // Convert MongoDB objects to plain objects to avoid serialization issues
  const plainMongoUser = JSON.parse(JSON.stringify(mongoUser));

  return (
    <div className="flex h-full w-full">
      <ChatroomsSendClient mongoUser={plainMongoUser} isAdmin={isAdmin} />
    </div>
  );
}
