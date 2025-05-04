"use client";

import { useTranslation } from "@/components/Context/TranslationContext";
import AddFeedChatmessageForm from "@/components/Post/AddPostCustom/MoreThanFriend/AddFeedChatmessageForm";
import { handleWelcomeMessage } from "@/lib/actions/handleWelcomeMessage";

export default function AddWelcomeMessageForm({
  mongoUser,
  updatingPost,
  onSuccess,
}) {
  const { t } = useTranslation();

  const handleCustomSubmit = async (data) => {
    // Add mongoUser to the data for attachment creation
    const dataWithUser = {
      ...data,
      mongoUser,
    };

    const result = await handleWelcomeMessage(dataWithUser);
    if (result.success && onSuccess) {
      onSuccess();
    }
    return result;
  };

  return (
    <div className={`h-auto max-h-[50dvh] oya shrink-0`}>
      <AddFeedChatmessageForm
        {...{
          hideExpirationPeriod: true,
          hideSchedule: true,
          placeholder: t("composeWelcomeMessage"),
          col: { name: "chatmessages" },
          mongoUser,
          customOnSubmit: handleCustomSubmit,
          submitBtnClassName: "poa !b15 !r15 mla",
          submitBtnText: updatingPost ? "update" : "save",
          updatingPost: updatingPost
            ? {
                text: updatingPost.chatMsgText,
                files: updatingPost.files,
                expirationPeriod: updatingPost.expirationPeriod,
                scheduleAt: updatingPost.scheduleAt,
              }
            : null,
        }}
      />
    </div>
  );
}
