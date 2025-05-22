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

      // Separate files into different categories
      const croppedFiles = files?.filter(
        (file) => file.needsUpload && file.isCropped
      );
      const standardNewFiles = files?.filter(
        (file) => !file._id && !file.needsUpload
      );
      const existingFiles = files?.filter((file) => file._id) || [];
      const existingFileIds = existingFiles.map((file) => file._id);

      // Upload standard new files
      let standardUploadedFiles = [];
      if (standardNewFiles?.length > 0) {
        try {
          standardUploadedFiles = await uploadFilesToCloudinary(
            standardNewFiles,
            col.name,
            null,
            {
              skipNSFWCheck: false,
              t,
            }
          );
        } catch (error) {
          // Handle MINOR_DETECTED and LOW_QUALITY_IMAGE errors
          if (error?.message === "MINOR_DETECTED") {
            const fileName =
              (standardNewFiles[0] && standardNewFiles[0].name) || "";
            let msg = fileName
              ? t(
                  "imageFilenameContainsMinor",
                  { filename: fileName },
                  `Image (${fileName}) contains a minor and cannot be uploaded.`
                )
              : t(
                  "imageContainsMinor",
                  "Image contains a minor and cannot be uploaded."
                );
            onError?.({
              message: msg,
              ...error,
            });
            setIsFormLoading(false);
            return;
          } else if (error?.message === "LOW_QUALITY_IMAGE") {
            const fileName =
              (standardNewFiles[0] && standardNewFiles[0].name) || "";
            let msg = fileName
              ? t(
                  "imageFilenameTooLowQuality",
                  { filename: fileName },
                  `Image (${fileName}) quality is too low. Only high-quality images are accepted.`
                )
              : t(
                  "imageTooLowQuality",
                  "Image quality is too low. Only high-quality images are accepted."
                );
            onError?.({
              message: msg,
              ...error,
            });
            setIsFormLoading(false);
            return;
          }
          throw error;
        }
      }

      // Upload cropped files with their original file data
      let croppedUploadedFiles = [];
      if (croppedFiles?.length > 0) {
        for (const croppedFile of croppedFiles) {
          // Prepare upload options for the cropped file
          let uploadOptions = {
            isCroppedImage: true,
            skipNSFWCheck: false,
          };

          // Handle original file reference
          if (croppedFile.originalFileData) {
            const { fileId, originalFile, imageUrl, possibleFileId } =
              croppedFile.originalFileData;

            // If we have a fileId (original already on Cloudinary)
            if (fileId) {
              uploadOptions.originalFileId = fileId;
            }
            // If we have an original File object that needs uploading first
            else if (originalFile) {
              const originalUploaded = await uploadFilesToCloudinary(
                [originalFile],
                col.name,
                null,
                { t }
              );

              if (!originalUploaded || originalUploaded.length === 0) {
                throw new Error("Failed to upload original image");
              }

              uploadOptions.originalFileId = originalUploaded[0].fileId;
            }
            // If we have a URL with possible file ID
            else if (possibleFileId) {
              uploadOptions.originalFileId = possibleFileId;
            }
          }

          try {
            // Upload the cropped file with the original reference
            const uploadedCroppedFile = await uploadFilesToCloudinary(
              [croppedFile.croppedFile],
              col.name,
              null,
              {
                ...uploadOptions,
                t,
              }
            );

            if (!uploadedCroppedFile || uploadedCroppedFile.length === 0) {
              throw new Error("Failed to upload cropped image");
            }

            croppedUploadedFiles.push(uploadedCroppedFile[0]);
          } catch (error) {
            if (error?.message === "MINOR_DETECTED") {
              const fileName = croppedFile.croppedFile?.name || "";
              let msg = fileName
                ? t(
                    "imageFilenameContainsMinor",
                    { filename: fileName },
                    `Image (${fileName}) contains a minor and cannot be uploaded.`
                  )
                : t(
                    "imageContainsMinor",
                    "Image contains a minor and cannot be uploaded."
                  );
              onError?.({
                message: msg,
                ...error,
              });
              setIsFormLoading(false);
              return;
            } else if (error?.message === "LOW_QUALITY_IMAGE") {
              const fileName = croppedFile.croppedFile?.name || "";
              let msg = fileName
                ? t(
                    "imageFilenameTooLowQuality",
                    { filename: fileName },
                    `Image (${fileName}) quality is too low. Only high-quality images are accepted.`
                  )
                : t(
                    "imageTooLowQuality",
                    "Image quality is too low. Only high-quality images are accepted."
                  );
              onError?.({
                message: msg,
                ...error,
              });
              setIsFormLoading(false);
              return;
            }
            throw error;
          }
        }
      }

      // Combine all newly uploaded files
      const serverUploadedFiles = [
        ...standardUploadedFiles,
        ...croppedUploadedFiles,
      ];

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

          // Set isPaid, relatedPostId and blurredUrl
          attachmentData.isPaid = price > 0;
          attachmentData.relatedPostId = postId;
          attachmentData.blurredUrl = file.blurredUrl;

          // Add isCropped flag and originalFileId if available
          if (file.isCropped) {
            attachmentData.isCropped = true;
          }
          if (file.originalFileId) {
            attachmentData.originalFileId = file.originalFileId;
          }

          // Explicitly set face detection related fields
          attachmentData.faceCount = file.faceCount || 0;
          attachmentData.hasMinor = file.hasMinor || false;
          attachmentData.hasSunglasses = file.hasSunglasses || false;

          // Set image quality fields
          attachmentData.imageQualityScore = file.imageQualityScore || 1.0;
          attachmentData.isLowQuality = file.isLowQuality || false;

          // Log to verify correct values for each file
          console.log(
            `Creating attachment for file: ${file.fileName || "unknown"}`
          );
          console.log(
            `faceCount: ${attachmentData.faceCount}, hasMinor: ${attachmentData.hasMinor}, hasSunglasses: ${attachmentData.hasSunglasses}`
          );
          console.log(
            `imageQualityScore: ${attachmentData.imageQualityScore}, isLowQuality: ${attachmentData.isLowQuality}`
          );

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
