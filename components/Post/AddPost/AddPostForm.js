"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useContext } from "../../Context/Context";
import AddFiles from "../../Cloudinary/AddFiles";
import useOnSubmitAddPostForm from "./useOnSubmitAddPostForm";
import useDevAutoFill from "./useDevAutoFill";
import Button from "@/components/ui/shared/Button/Button";
import { contactHandler } from "@/components/Post/AddPost/handlers/contactHandler";
import { defaultHandler } from "@/components/Post/AddPost/handlers/defaultHandler";
import LoadingSpinner from "@/components/ui/shared/LoadingSpinner/LoadingSpinner";

const collectionHandlers = {
  contacts: contactHandler,
  default: defaultHandler,
};

export default function AddPostForm({
  col,
  updatingPost,
  mongoUser,
  children,
  hasFiles,
  isRequiredFiles,
  isDev,
}) {
  const [files, filesSet] = useState(updatingPost?.files || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toastSet, dialogSet } = useContext();

  useDevAutoFill({ isDev, updatingPost });

  const handleSuccess = async ({ res, form, mode }) => {
    // Get the specific handler for this collection, or use default
    const handler = collectionHandlers[col.name] || collectionHandlers.default;

    handler({
      res,
      form,
      mode,
      router,
      toastSet,
      dialogSet,
      col,
    });

    setTimeout(() => {
      setIsSubmitting(false);
    }, 15000);
  };

  const handleError = (error) => {
    toastSet({ isOpen: true, title: "An error occurred", type: "error" });
    setTimeout(() => {
      setIsSubmitting(false);
    }, 15000);
  };

  const { onSubmitAddPostForm } = useOnSubmitAddPostForm({
    mongoUser,
    col,
    updatingPost,
    files: hasFiles ? files : null,
    onSuccess: handleSuccess,
    onError: handleError,
  });

  const handleSubmit = async (e) => {
    setIsSubmitting(true);
    await onSubmitAddPostForm(e);
  };

  return (
    <form
      className="👋 bg-background fc aic g30 wf mxa my15 p15 pb50"
      onSubmit={handleSubmit}
    >
      {/* 
      if addPostTitle is not defined, use the default title, eg: "Adding product";
      if addPostTitle is null => show nothing
      */}
      {col.settings?.addPostTitle !== undefined ? (
        <div className="t_15">{col.settings?.addPostTitle}</div>
      ) : (
        <div className="t_15">
          {updatingPost
            ? `Updating ${col.name.replace(/s$/, "")}`
            : `Adding ${col.name.replace(/s$/, "")}`}
        </div>
      )}
      {hasFiles && <AddFiles {...{ files, filesSet, isRequiredFiles, col }} />}
      {/* auto generated inputs based on the model (schema) */}
      {children}

      {/* 
      if addPostBtnText is not defined, use the default text, eg: "Submit";
      if addPostBtnText is null => show nothing
       */}
      {col.settings?.addPostBtnText ||
      col.settings?.addPostBtnText === undefined ? (
        <Button
          type="submit"
          className="pof b15"
          variant="black"
          disabled={isSubmitting}
        >
          <LoadingSpinner
            isSubmitting={isSubmitting}
            loadingText="Submitting..."
            initialText={col.settings?.addPostBtnText}
          />
        </Button>
      ) : null}
    </form>
  );
}
