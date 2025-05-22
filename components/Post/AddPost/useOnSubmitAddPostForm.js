import { add, update } from "@/lib/actions/crud";
import uploadFilesToCloudinary from "../../Cloudinary/uploadFilesToCloudinary";
import { formatFileData } from "@/lib/utils/files/formatFileData";
import { useTranslation } from "@/components/Context/TranslationContext";

export default function useOnSubmitAddPostForm({
  mongoUser,
  col,
  updatingPost,
  files,
  onSuccess,
  onError,
}) {
  const { t } = useTranslation();

  const onSubmitAddPostForm = async (e) => {
    e.preventDefault();

    try {
      const form = Object.fromEntries(new FormData(e.target));

      // Upload files to Cloudinary if files exist
      let serverUploadedFiles = [];
      if (files && files.length > 0) {
        serverUploadedFiles = await uploadFilesToCloudinary(
          files,
          col.name,
          null,
          { t }
        );
        // Add files data to form
        form.files = serverUploadedFiles.map((file) =>
          formatFileData(file, col.name)
        );
      } else {
        form.files = [];
      }

      let postId;

      if (!updatingPost) {
        // ! ADD POST MODE
        const res = await add({
          col,
          data: {
            ...form,
            createdBy: mongoUser?._id,
          },
        });

        if (!res) {
          console.log("post not created!");
          return;
        }

        postId = res._id;
        // Call success callback with the result and form data
        onSuccess?.({ res, form, mode: "add" });
      } else {
        // ! UPDATE POST MODE
        const res = await update({
          col,
          data: { _id: updatingPost._id },
          update: { ...form },
        });

        postId = updatingPost._id;
        // Call success callback with the result and form data
        onSuccess?.({ res, form, mode: "update" });
      }

      // TODO !!!!!! delete we add attachments info in useOnSubmitAddPostFormWithSepAttachmentCol
      // If we have files and a post ID, update each file with the relatedPostId
      if (postId && form.files && form.files.length > 0) {
        // For each file, if it has an _id, update it with the relatedPostId
        await Promise.all(
          form.files.map(async (file) => {
            if (file._id) {
              await update({
                col: { name: "attachments" },
                data: { _id: file._id },
                update: { relatedPostId: postId },
              });
            }
          })
        );
      }
    } catch (error) {
      console.log(error);
      onError?.(error);
    }
  };

  return { onSubmitAddPostForm };
}
