"use client";

import { format } from "date-fns";
import Post from "../Post";
import ChatmessagePostCreatedBy from "./ChatmessagePostCreatedBy";
import RichTextContent from "@/components/ui/shared/RichTextContent/RichTextContent";
import Carousel from "@/components/ui/shared/Carousel/Carousel";
import ChatmessagePostFileCount from "./ChatmessagePostFileCount";
import ReplyButton from "@/components/Reply/ReplyButton";
import ReplyPreview from "@/components/Reply/ReplyPreview";
import { useTranslation } from "@/components/Context/TranslationContext";
import PaidContentOverlay from "../PaidContentOverlay";

export default function ChatmessagePost(props) {
  const {
    post,
    mongoUser,
    className = "",
    isChatRoom = false,
    chatRoomMainPersona,
    onReply,
    col,
  } = props;
  if (!post) return null;
  let isOwnMessage =
    mongoUser &&
    post?.createdBy?._id &&
    mongoUser._id.toString() === post?.createdBy?._id.toString();
  isOwnMessage = isChatRoom === true ? false : isOwnMessage;
  const msgHiddenByOtherUser = post.msgHiddenByOtherUser;
  const { t } = useTranslation();

  // Check if files are paid and need to be hidden
  const hasPaidFiles = post?.price && post?.price > 0;
  const shouldShowOverlay = hasPaidFiles && !isOwnMessage && !post.hasPurchased;

  // TODO !!! format comp for all Timestamps
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    return format(new Date(timestamp), "HH:mm");
  };

  return (
    <Post
      {...props}
      col={col}
      showFiles={false}
      showTags={false}
      showCreatedAt={false}
      showCreatedAtTimeAgo={false}
      useCard={false}
      showAutoGenMongoFields={false}
      showCreatedBy={false}
      className={`min-[769px]:maw600 wf fui ${
        isChatRoom
          ? "!m0 !p0"
          : isOwnMessage
          ? "flex justify-end"
          : "flex justify-start"
      }`}
      iconsClassName="poa r20 -t2"
      top3={
        <div
          className={`f fwn ${msgHiddenByOtherUser ? "!opacity-30 pen" : ""}`}
        >
          {/* // * Hidden message indicator */}
          {msgHiddenByOtherUser && (
            <div className="poa -t15 r0 fz10 bad">{t("hiddenByReceiver")}</div>
          )}

          {/* // * Created By */}
          <ChatmessagePostCreatedBy
            {...{
              post,
              isOwnMessage,
              chatRoomMainPersona,
            }}
          />

          <div className="fc por">
            {/* // * Carousel */}
            {!isChatRoom && post.files?.length > 0 && (
              <div className={`por mih300 miw300`}>
                <Carousel
                  showThumbnails={false}
                  showIndicators={false}
                  showArrows={post.files?.length > 1}
                  files={post.files}
                />

                {/* Show paid content overlay if needed */}
                {shouldShowOverlay && !isChatRoom && (
                  <PaidContentOverlay
                    post={post}
                    mongoUser={mongoUser}
                    col={{ name: "chatmessages" }}
                  />
                )}
              </div>
            )}

            {/* // * Message text */}
            {(post.chatMsgText?.trim().length > 0 || isChatRoom) && (
              <div
                className={`!pt32 wf rounded-lg relative ${
                  post.chatReplyToMsgId && !isChatRoom ? "!p0" : "p12"
                } ${
                  isOwnMessage
                    ? "bg-accent !text-foreground mla"
                    : `${
                        isChatRoom
                          ? "!pl0 bg-transparent"
                          : "border-[--color-brand] bw1 bg-accent"
                      } text-foreground`
                } ${isChatRoom ? `` : `pt25`} ${className}`}
              >
                {/* Reply message preview if this is a reply */}
                {post.chatReplyToMsgId && !isChatRoom && (
                  <ReplyPreview
                    replyTo={post.chatReplyToMsgId}
                    isMsgPreview={true}
                    isOwnMessage={isOwnMessage}
                  />
                )}

                {/* Show file counts in chatroom */}
                {isChatRoom && (
                  <ChatmessagePostFileCount
                    files={post.files}
                    isOwnMessage={isOwnMessage}
                  />
                )}

                <RichTextContent
                  content={post.chatMsgText}
                  className={`${
                    isOwnMessage ? "text-foreground" : "text-foreground"
                  } ${isChatRoom ? "line-clamp-1" : "px10"}`}
                />
                <div
                  className={`f g10 fwn text-xs mt0 ${
                    isOwnMessage
                      ? "text-muted-foreground"
                      : "text-muted-foreground"
                  } ${isChatRoom ? "" : "px10"}`}
                >
                  {/* // * Status */}
                  {isOwnMessage && (
                    <span className="">
                      {post.chatMsgStatus === "delivered" && "✓"}
                      {post.chatMsgStatus === "read" && "✓✓"}
                      {post.chatMsgStatus === "failed" && "⚠️"}
                    </span>
                  )}
                  {/* // * Time */}
                  <span className="!fz12 gray">
                    {formatTimestamp(post.createdAt)}
                  </span>

                  {/* Reply button */}
                  {onReply && post?.hasPurchased && (
                    <ReplyButton
                      className="!fz12"
                      onClick={() => onReply(post)}
                    />
                  )}

                  {isOwnMessage && post?.price > 0 && (
                    <span className="brand">${post?.price}</span>
                  )}

                  {post?.hasPurchased && (
                    <span className="brand">Purchased</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      }
    />
  );
}
