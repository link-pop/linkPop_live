"use client";

import Button2 from "@/components/ui/shared/Button/Button2";
import { useTranslation } from "@/components/Context/TranslationContext";
import { CHATROOMS_SEND_ROUTE } from "@/lib/utils/constants";

// * Empty state when no chatroom is selected
export default function ChatroomsEmptyState({ postsFoundNum }) {
  const { t } = useTranslation();

  if (postsFoundNum === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-sm font-style-italic">
        <div className="title text-center">{t("noConversationsYet")}</div>
        <Button2
          text={t("newMessage")}
          className="w-fit-content mx-auto uppercase whitespace-nowrap mt-8"
          href={CHATROOMS_SEND_ROUTE}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-sm font-style-italic">
      <div className="title text-center">
        {t("selectAnyConversationOrSendANewMessage")}
      </div>
      <Button2
        text={t("newMessage")}
        className="w-fit-content mx-auto uppercase whitespace-nowrap mt-8"
        href={CHATROOMS_SEND_ROUTE}
      />
    </div>
  );
}
