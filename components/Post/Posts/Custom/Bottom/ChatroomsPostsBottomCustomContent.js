import ChatroomFullPost from "@/components/Post/Post/Full/Custom/ChatroomFullPost";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getOne } from "@/lib/actions/crud";
import PostsLoader from "../../PostsLoader";
import Button2 from "@/components/ui/shared/Button/Button2";
import { useEffect } from "react";
import useChatRoomsUpdates from "@/hooks/useChatRoomsUpdates";
import useLayoutWidth from "@/hooks/useLayoutWidth";
import { useTranslation } from "@/components/Context/TranslationContext";

// * shows chatrooms list & messages of the selected chatroom
export default function ChatroomsPostsBottomCustomContent({
  col,
  isAdmin,
  mongoUser,
  postsFoundNum,
}) {
  useLayoutWidth("1000");
  const { t } = useTranslation();

  if (col.name !== "chatrooms") return null;
  const chatId = useSearchParams().get("chatId");

  // * get selected chatroom
  const { data: chatroom, isLoading } = useQuery({
    queryKey: ["chat", "room", chatId],
    queryFn: () => getOne({ col: "chatrooms", data: { _id: chatId } }),
    enabled: !!chatId,
  });

  // Add real-time updates for chat rooms
  useChatRoomsUpdates(chatId);

  // * if no selected chatroom, show "New message" button
  // ! DON'T MOVE THIS CODE UP - will get error: renders fewer hooks
  if (!chatId && postsFoundNum > 0)
    return (
      <div className="dn md:fc flex-[1_0_600px] wf fz12 fsi pt100 opacity-30">
        <div className="title tac">
          {t("selectAnyConversationOrSendANewMessage")}
        </div>
        <Button2 text={t("newMessage")} className="wfc mxa ttu wsn mt30" />
      </div>
    );
  // ? if (isLoading) return <PostsLoader isLoading={isLoading} />;

  return (
    <>
      {/* // * shows ONE chatroom & its messages */}
      <ChatroomFullPost {...{ post: chatroom, isAdmin, mongoUser }} />
    </>
  );
}
