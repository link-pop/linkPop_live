import ChatroomsLayoutClient from "./ChatroomsLayoutClient";
import MessagesTitle from "../Custom/MoreThanFriend/MessagesTitle";

// * Layout component for chatrooms that shows title and right content
export default function ChatroomsLayout({ children, onChatMessageSearch }) {
  return (
    <>
      <MessagesTitle onChatMessageSearch={onChatMessageSearch} />
      <div className="h-full w-full max-w-[1000px] mx-auto">
        {/* Container for the entire chatrooms layout */}
        <ChatroomsLayoutClient>{children}</ChatroomsLayoutClient>
      </div>
    </>
  );
}
