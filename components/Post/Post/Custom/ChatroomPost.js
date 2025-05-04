import React, { useEffect } from "react";
import Post from "../Post";
import {
  BRAND_INVERT_CLASS,
  CHATS_ROUTE,
  MOBILE_SM,
} from "@/lib/utils/constants";
import ChatmessagePost from "./ChatmessagePost";
import CreatedBy from "../CreatedBy";
import { useRouter, useSearchParams } from "next/navigation";
import useWindowWidth from "@/hooks/useWindowWidth";
import { useChat } from "@/components/Context/ChatContext";
import removeHtmlFromText from "@/lib/utils/removeHtmlFromText";

export default function ChatroomPost(props) {
  const { post, col, isAdmin, mongoUser } = props;
  const personaUserChattingWith = post.chatRoomUsers.find(
    (user) => user._id !== mongoUser._id
  );
  const router = useRouter();
  const searchParams = useSearchParams();
  const { windowWidth } = useWindowWidth();
  const chatId = searchParams.get("chatId");
  const { getUnreadCount, setActiveChatRoomId } = useChat();

  // Get unread count for this chat room
  const unreadCount = getUnreadCount(post._id);

  // Set active chat room when selected
  useEffect(() => {
    if (!chatId) return;
    if (chatId === post._id) {
      setActiveChatRoomId(post._id);
    }
  }, [chatId, post._id, setActiveChatRoomId]);

  // * don't show chatrooms on mobile if chatId is selected
  if (windowWidth <= MOBILE_SM && chatId) return null;

  const isSelectedChat = chatId === post._id;

  return (
    <>
      <Post
        {...props}
        noOtherIcons={true}
        showTags={false}
        showCreatedAt={false}
        showCreatedAtTimeAgo={false}
        useCard={false}
        showAutoGenMongoFields={false}
        showCreatedBy={false}
        className={`fui !m0 !p0 md:!maw400 wf hover:bg-accent border-b ${
          isSelectedChat ? "!bg-accent" : ""
        }`}
        iconsClassName="poa r20 -t2"
        top={
          <div
            onClick={() => router.push(`${CHATS_ROUTE}?chatId=${post._id}`)}
            className={`db wf md:!maw400 wf relative`}
          >
            {/* // TODO !!!!! use NotificationBadge */}
            {unreadCount > 0 && !isSelectedChat && (
              <div
                className={`bg_brand z2 poa l4 t27 bg-primary text-primary-foreground rounded-full min-w-[20px] h-[20px] flex items-center justify-center text-xs font-bold px-1`}
              >
                <span className={`${BRAND_INVERT_CLASS}`}>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              </div>
            )}
            <ChatmessagePost
              {...{
                chatRoomMainPersona: (
                  <CreatedBy
                    // ???
                    nameClassName={`poa t13`}
                    className="w50 ml5 mt5 !pr0"
                    createdBy={personaUserChattingWith}
                  />
                ),
                showExpiresAt: false,
                showScheduleAt: false,
                post: {
                  ...post?.chatRoomLastMsg,
                  chatMsgText: removeHtmlFromText(
                    post?.chatRoomLastMsg?.chatMsgText || "..."
                  ),
                } || {
                  chatMsgText: "...", // * msg error OR empty msg
                  createdBy: mongoUser._id,
                },
                isChatRoom: true,
                className: `bw0 br0`,
                mongoUser,
                col: {
                  name: "chatmessages",
                  settings: {
                    noFullPost: true,
                    noUpdateIcon: true,
                    hasLikes: false,
                    noOtherIcons: true,
                  },
                },
              }}
            />
          </div>
        }
      />
    </>
  );
}
