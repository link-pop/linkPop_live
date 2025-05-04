import { add, update } from "@/lib/actions/crud";
import uploadFilesToCloudinary from "../../Cloudinary/uploadFilesToCloudinary";
import { useState } from "react";
import { useContext } from "@/components/Context/Context";
import removeHtmlFromText from "@/lib/utils/removeHtmlFromText";
import { formatAttachmentData } from "@/lib/utils/files/formatFileData";
import { useTranslation } from "@/components/Context/TranslationContext";

export default function useOnSubmitAddPostFormWithSepAttachmentCol({
  mongoUser,
  col,
  updatingPost,
  files,
  tipTapInputContent,
  expirationPeriod,
  scheduleAt,
  price,
  onSuccess,
  onError,
}) {
  const [isFormLoading, setIsFormLoading] = useState(false);
  const { dialogSet } = useContext();
  const { t } = useTranslation();

  const onSubmitAddPostForm = async (e) => {
    e.preventDefault();
    setIsFormLoading(true);
    try {
      // VALIDATE FILES
      if (!files || files?.length === 0) {
        dialogSet({
          isOpen: true,
          title: t("noFilesSelected"),
        });
        setIsFormLoading(false);
        return;
      }

      // VALIDATE TEXT CONTENT
      if (
        !tipTapInputContent ||
        removeHtmlFromText(tipTapInputContent) === ""
      ) {
        dialogSet({
          isOpen: true,
          title: t("noTextContent"),
        });
        setIsFormLoading(false);
        return;
      }

      // VALIDATE PRICE WITH FILES
      if (price > 0 && (!files || files?.length === 0)) {
        dialogSet({
          isOpen: true,
          title: t("priceSetNoFiles"),
          text: t("priceSetNoFilesDescription"),
        });
        setIsFormLoading(false);
        return;
      }

      // Separate files into new and existing
      const newFiles = files?.filter((file) => !file._id);
      const existingFiles = files?.filter((file) => file._id) || [];
      const existingFileIds = existingFiles.map((file) => file._id);

      let serverUploadedFiles = [];
      if (newFiles?.length > 0) {
        serverUploadedFiles = await uploadFilesToCloudinary(newFiles, col.name);
      }

      // Prepare data for submission (only include necessary fields)
      const postData = {
        text: tipTapInputContent,
        files: [], // Will be updated after attachment creation
        createdBy: mongoUser?._id,
        expirationPeriod: expirationPeriod || null,
        scheduleAt: scheduleAt ? new Date(scheduleAt).toISOString() : null,
        price: price > 0 ? price : null, // Ensure price is null when not set
      };

      let postId;
      let res;

      // First create or update the post
      if (!updatingPost) {
        // ADD POST MODE - Create post first with existing file IDs
        postData.files = existingFileIds;
        res = await add({
          col,
          data: postData,
        });

        if (!res) {
          console.error("Post not created!");
          throw new Error("Failed to create post");
        }

        postId = res._id;
      } else {
        // UPDATE POST MODE
        postData.files = existingFileIds;
        res = await update({
          col,
          data: { _id: updatingPost._id },
          update: postData,
        });

        if (!res) {
          console.error("Post not updated!");
          throw new Error("Failed to update post");
        }

        postId = updatingPost._id;
      }

      // If price is set, update existing attachments to be paid
      if (existingFileIds.length > 0) {
        await Promise.all(
          existingFileIds.map(async (fileId) => {
            await update({
              col: { name: "attachments" },
              data: { _id: fileId },
              update: {
                relatedPostId: postId,
                isPaid: price > 0,
              },
            });
          })
        );
      }

      // Now create attachment records for new files with the post ID
      const newAttachmentIds = [];
      if (serverUploadedFiles.length > 0) {
        for (const file of serverUploadedFiles) {
          const attachmentData = formatAttachmentData(
            file,
            col.name,
            mongoUser?._id
          );

          // TODO !!!!!! make new sep file uploading, coz cur user can delete filter str and get original image
          // Set isPaid, relatedPostId and blurredUrl
          attachmentData.isPaid = price > 0;
          attachmentData.relatedPostId = postId;
          attachmentData.blurredUrl = file.blurredUrl;

          const attachment = await add({
            col: { name: "attachments" },
            data: attachmentData,
          });

          if (!attachment?._id) {
            throw new Error("Failed to create attachment record");
          }

          newAttachmentIds.push(attachment._id);
        }
      }

      // If we have new attachments, update the post to include them
      if (newAttachmentIds.length > 0) {
        const allFileIds = [...existingFileIds, ...newAttachmentIds];
        await update({
          col,
          data: { _id: postId },
          update: { files: allFileIds },
        });

        // Update the response object with the updated files array
        res.files = allFileIds;
      }

      // Call onSuccess with the appropriate mode
      onSuccess?.({
        res,
        mode: updatingPost ? "update" : "add",
      });
    } catch (error) {
      console.error("Error in onSubmitAddPostForm:", error);
      onError?.(error);
    } finally {
      setIsFormLoading(false);
    }
  };

  return { onSubmitAddPostForm, isFormLoading };
}
