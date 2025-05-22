"use client";

import MessagesInfiniteScroll from "@/components/Post/Posts/MessagesInfiniteScroll";
import { useChat } from "@/components/Context/ChatContext";
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import ChatroomFullPostHeader from "./ChatroomFullPostHeader";
import AddFeedChatmessageForm from "@/components/Post/AddPostCustom/MoreThanFriend/AddFeedChatmessageForm";
import { useContext } from "@/components/Context/Context";
import Button from "@/components/ui/shared/Button/Button2";
import uploadFilesToCloudinary from "@/components/Cloudinary/uploadFilesToCloudinary";
import { add } from "@/lib/actions/crud";
import { formatAttachmentData } from "@/lib/utils/files/formatFileData";
import SOCKET_EVENTS from "@/chatServer/constants/socketEvents";
import { useTranslation } from "@/components/Context/TranslationContext";
import ChatNotificationHandler from "@/components/Chat/ChatNotificationHandler";
import useNormalizeChatroomFullPostAllMsg from "./hooks/useNormalizeChatroomFullPostAllMsg";

// * shows chatroom & its messages
export default function ChatroomFullPost({ post: chat, isAdmin, mongoUser }) {
  if (!chat) return null;
  const chatId = chat._id;
  const { socket, connected, userId, replyTo, onReply, onCancelReply } =
    useChat();
  const queryClient = useQueryClient();
  const { toastSet } = useContext();
  const feedFormRef = useRef();
  const { t } = useTranslation();

  // TODO !!!!! REMOVE not needed: added h-[calc(100dvh-75px)] to ChatroomFullPostAllMsg
  // useNormalizeChatroomFullPostAllMsg();

  useEffect(() => {
    if (!socket || !userId) return;

    socket.on(SOCKET_EVENTS.CHAT.MESSAGE.RECEIVED(chatId), () => {
      // Invalidate and refetch messages query
      queryClient.invalidateQueries({
        queryKey: ["chat", "messages", chatId],
      });
      // Reset form
      feedFormRef?.current?.reset();
      // Clear reply state
      onCancelReply();
    });

    socket.on(SOCKET_EVENTS.CHAT.MESSAGE.ERROR, (error) => {
      console.error("Message error:", error);
      toastSet({
        isOpen: true,
        title: t("errorSendingMessage"),
        text: error,
      });
    });

    return () => {
      socket.off(SOCKET_EVENTS.CHAT.MESSAGE.RECEIVED(chatId));
      socket.off(SOCKET_EVENTS.CHAT.MESSAGE.ERROR);
    };
  }, [socket, chatId, userId, queryClient, toastSet, onCancelReply, t]);

  const handleMessageSubmit = async ({
    files,
    tipTapInputContent,
    expirationPeriod,
    scheduleAt,
    price,
  }) => {
    // Allow sending if there are files OR non-empty text
    if (
      (files.length === 0 && !tipTapInputContent.trim()) ||
      !connected ||
      !socket
    )
      return;

    try {
      // Handle files
      let processedFiles = null;
      if (files.length > 0) {
        // If files already have fileUrl, they're from vault - use them as is
        const newFiles = files.filter((file) => !file.fileUrl);
        const existingFiles = files.filter((file) => file.fileUrl);

        // Upload new files to Cloudinary
        if (newFiles.length > 0) {
          const uploadedFiles = await uploadFilesToCloudinary(
            newFiles,
            "chatmessages",
            null,
            { t }
          );

          // Create attachment records for new files
          const attachmentPromises = uploadedFiles.map(async (file) => {
            const attachmentData = formatAttachmentData(
              file,
              "chatmessages",
              userId,
              {
                isPaid: price > 0,
              }
            );

            const attachment = await add({
              col: { name: "attachments" },
              data: attachmentData,
            });

            if (!attachment?._id) {
              throw new Error("Failed to create attachment record");
            }

            return {
              _id: attachment._id,
              ...file,
            };
          });

          const newAttachments = await Promise.all(attachmentPromises);
          processedFiles = [...existingFiles, ...newAttachments];
        } else {
          processedFiles = existingFiles;
        }
      }

      // Send message through socket
      socket.emit(SOCKET_EVENTS.CHAT.MESSAGE.SEND, {
        chatId,
        message: tipTapInputContent.trim() || " ", // Send space if empty to satisfy server validation
        userId,
        files: processedFiles,
        expirationPeriod,
        scheduleAt,
        replyToMsgId: replyTo?._id || null,
        price: price > 0 ? price : null,
      });
    } catch (error) {
      console.error("Error handling files:", error);
      toastSet({
        isOpen: true,
        title: t("errorUploadingFiles"),
        text: t("failedToUploadFiles"),
      });
    }
  };

  return (
    <div
      className={`ChatroomFullPostAllMsg border-l border-r !oh !oyh !fc !fwn h-[calc(100dvh-75px)] !w-[600px] !maw-[600px] max-[768px]:!w-[100vw] max-[768px]:!mw-[100vw] RightChatroomPart`}
    >
      {/* Handle notifications for this chat */}
      <ChatNotificationHandler chatId={chatId} mongoUser={mongoUser} />

      {/* // * ABSOLUTE */}
      <ChatroomFullPostHeader {...{ chat, mongoUser }} />

      <div className="oh">
        {/* // * MESSAGES  */}
        <MessagesInfiniteScroll
          col={{
            name: "chatmessages",
            settings: { noFullPost: true, noUpdateIcon: true, hasLikes: true },
            // * isAdmin,
          }}
          mongoUser={mongoUser}
          showFoundNum={false}
          chatRoomId={chatId}
          onReply={onReply}
        />
      </div>

      <div className="mta h-auto max-h-[50dvh] oya shrink-0 border-t">
        <AddFeedChatmessageForm
          hideExpirationPeriod={true}
          placeholder={t("writeMessage")}
          ref={feedFormRef}
          col={{ name: "chatmessages" }}
          mongoUser={mongoUser}
          customOnSubmit={handleMessageSubmit}
          submitBtnClassName={`poa !b15 !r15 mla`}
          submitBtnText={t("send")}
          replyTo={replyTo}
          onCancelReply={onCancelReply}
        />
      </div>
    </div>
  );
}
