import { useTranslation } from "@/components/Context/TranslationContext";
import Button from "@/components/ui/shared/Button/Button2";
import { getOne } from "@/lib/actions/crud";
import { useEffect, useState } from "react";

export default function UserFullPostSendMessageButton({
  post: subscribedToUser,
  mongoUser,
  showSendMsgBtn,
}) {
  // * don't show button to yourself
  if (subscribedToUser._id === mongoUser?._id) return null;

  const [chatRoom, chatRoomSet] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    async function getChatRoom() {
      const res = await getOne({
        col: "chatrooms",
        data: {
          chatRoomUsers: {
            $all: [mongoUser?._id, subscribedToUser._id],
          },
        },
      });
      chatRoomSet(res);
    }
    getChatRoom();
  }, []);

  if (!chatRoom) return null;
  return (
    showSendMsgBtn && (
      <Button
        className={`aconfetti`}
        href={`/chatrooms/${chatRoom?._id}`}
        text={t("sendMessage")}
      />
    )
  );
}
