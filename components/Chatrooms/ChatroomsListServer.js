import ChatroomsList from "./ChatroomsList";
import { getAllMongoCollectionsData } from "@/lib/utils/mongo/getAllMongoCollectionsData";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import { redirect } from "next/navigation";
import { LOGIN_ROUTE } from "@/lib/utils/constants";
import { postsColSpecialHandling } from "@/components/Post/Posts/PostsColSpecialHandling";
import { searchChatrooms } from "@/lib/actions/searchChatrooms";

// * Server component that fetches chatrooms data and passes to client component
export default async function ChatroomsListServer({ searchParams = {} }) {
  console.log("🔍 ChatroomsListServer - Received searchParams:", searchParams);

  const { mongoUser, isAdmin } = await getMongoUser();
  if (!mongoUser) redirect(LOGIN_ROUTE);

  const col = await getAllMongoCollectionsData("chatrooms");
  let data = {};

  // Check if there's a search query
  const searchQuery = searchParams.q;
  console.log("🔍 ChatroomsListServer - Search query:", searchQuery);

  if (searchQuery) {
    // Use search function for filtered results
    try {
      console.log(
        "🔍 ChatroomsListServer - Calling searchChatrooms with query:",
        searchQuery
      );
      data = await searchChatrooms(searchQuery);
      console.log("🔍 ChatroomsListServer - Search result data:", data);
    } catch (error) {
      console.error("❌ Error searching chatrooms:", error);
      // Fallback to regular filtering if search fails
      data = await postsColSpecialHandling(col, searchParams, data, mongoUser);
    }
  } else {
    // Apply special handling for chatrooms without search
    if (!isAdmin || col.name === "chatrooms") {
      data = await postsColSpecialHandling(col, searchParams, data, mongoUser);
    }
  }

  // Convert MongoDB objects to plain objects to avoid serialization issues
  const plainCol = JSON.parse(JSON.stringify(col));
  const plainMongoUser = JSON.parse(JSON.stringify(mongoUser));
  const plainData = JSON.parse(JSON.stringify(data));

  return (
    <ChatroomsList
      col={plainCol}
      mongoUser={plainMongoUser}
      isAdmin={isAdmin}
      data={plainData}
      searchParams={searchParams}
    />
  );
}
