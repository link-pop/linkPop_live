"use client";

import { useState } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";
import { useContext } from "@/components/Context/Context";
import AddFeedChatmessageForm from "@/components/Post/AddPostCustom/MoreThanFriend/AddFeedChatmessageForm";
import { sendMassMessage } from "@/lib/actions/sendMassMessage";
import { Users } from "lucide-react";
import Button from "@/components/ui/shared/Button/Button2";
import uploadFilesToCloudinary from "@/components/Cloudinary/uploadFilesToCloudinary";
import { add } from "@/lib/actions/crud";
import { formatAttachmentData } from "@/lib/utils/files/formatFileData";

// * Form for composing and sending mass messages
export default function ChatroomsSendMessageForm({
  mongoUser,
  selectedUsers,
  onClearSelection,
}) {
  const { t } = useTranslation();
  const { toastSet } = useContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMassMessageSubmit = async ({
    files,
    tipTapInputContent,
    expirationPeriod,
    scheduleAt,
    price,
  }) => {
    if (selectedUsers.length === 0) {
      toastSet({
        isOpen: true,
        title: t("noUsersSelected"),
        text: t("pleaseSelectUsersFirst"),
      });
      return;
    }

    // Allow messages with files only, but not completely empty messages
    if (!tipTapInputContent.trim() && (!files || files.length === 0)) {
      toastSet({
        isOpen: true,
        title: t("emptyMessage"),
        text: t("pleaseWriteMessageOrAddFiles"),
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Handle files on client side first
      let processedFiles = null;
      if (files && files.length > 0) {
        // Separate new files from existing vault files
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
              mongoUser._id,
              {
                isPaid: price > 0,
              }
            );

            // Ensure AI tags are included
            attachmentData.tags = file.aiTags || [];

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

      const result = await sendMassMessage({
        recipientIds: selectedUsers.map((user) => user._id),
        message: tipTapInputContent.trim(),
        files: processedFiles || [], // Pass processed files, not raw File objects
        expirationPeriod,
        scheduleAt,
        price,
        senderId: mongoUser._id,
      });

      if (result.success) {
        toastSet({
          isOpen: true,
          title: t("massMessageSent"),
          text: t("massMessageSentSuccessfully"),
        });
        onClearSelection();
        return { success: true }; // Return success to indicate form should be reset
      } else {
        throw new Error(result.error || "Failed to send mass message");
      }
    } catch (error) {
      console.error("❌ Error sending mass message:", error);
      toastSet({
        isOpen: true,
        title: t("errorSendingMassMessage"),
        text: error.message || t("unexpectedError"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeUser = (userId) => {
    const userToRemove = selectedUsers.find((u) => u._id === userId);
    if (userToRemove) {
      onClearSelection();
      // Re-add all users except the one being removed
      selectedUsers
        .filter((u) => u._id !== userId)
        .forEach((user) => {
          // This would need to be passed from parent, but for simplicity we'll clear all
        });
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header with selected users */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={20} />
            <span className="font-medium">
              {t("massMessage")} ({selectedUsers.length} {t("recipients")})
            </span>
          </div>
          {selectedUsers.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="text-xs"
            >
              {t("clearAll")}
            </Button>
          )}
        </div>
      </div>

      {/* Message form */}
      <div className="flex-1 p-4">
        <AddFeedChatmessageForm
          hideSubmitButton={false}
          hideExpirationPeriod={true}
          placeholder={t("composeYourMassMessage")}
          col={{ name: "chatmessages" }}
          mongoUser={mongoUser}
          customOnSubmit={handleMassMessageSubmit}
          submitBtnText={t("sendToAllSelected")}
          customIsLoading={isSubmitting}
          submitBtnClassName="w-full"
        />
      </div>
    </div>
  );
}
