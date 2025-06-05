"use client";

import { useRef, useState } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";
import TipTapInput from "../../AddPost/AddPostFormInput/TipTapInput";
import useAddFeedFormTipTapSettings from "./useAddFeedFormTipTapSettings";
import useAddFeedFormVaultFiles from "./useAddFeedFormVaultFiles";
import useAddFeedFormPostPrice from "./useAddFeedFormPostPrice";
import AddFiles from "../../../Cloudinary/AddFiles";
import AddFilesPreview from "@/components/Cloudinary/AddFilesPreview";
import AddFeedFormSubmitButton from "./AddFeedFormSubmitButton";
import useOnSubmitAddPostFormWithSepAttachmentCol from "../../AddPost/useOnSubmitAddPostFormWithSepAttachmentCol";
import { useRouter } from "next/navigation";
import PostsLoader from "../../Posts/PostsLoader";
import { useContext } from "@/components/Context/Context";
import VideoRecorder from "@/components/ui/shared/VideoRecorder/VideoRecorder";

export default function AddStoreItemForm({
  col,
  mongoUser,
  updatingPost,
  onCustomSuccess,
  hideSubmitButton = false,
  customOnSubmit,
  submitBtnClassName,
  onReset,
  placeholder,
  submitBtnText,
}) {
  const { t } = useTranslation();
  const router = useRouter();

  // Initialize form state with existing data if updating
  const [files, filesSet] = useState(updatingPost?.files || []);
  const [tipTapInputContent, setTipTapInputContent] = useState(
    updatingPost?.text || ""
  );
  const [title, setTitle] = useState(updatingPost?.title || "");
  const [category, setCategory] = useState(updatingPost?.category || "");
  const [price, priceSet] = useState(updatingPost?.price || 0);
  const { toastSet } = useContext();

  const { TipTapSettings, isTipTapSettingsVisible } =
    useAddFeedFormTipTapSettings();
  const { VaultFilesButton } = useAddFeedFormVaultFiles({
    filesSet,
    files,
    mongoUser,
  });
  const { PostPriceButton, PostPriceFormLabel } = useAddFeedFormPostPrice({
    priceSet,
    price,
    expirationPeriod: null, // Store items don't have expiration
  });
  const formRef = useRef(null);

  const resetForm = () => {
    filesSet([]);
    setTipTapInputContent("");
    setTitle("");
    setCategory("");
    priceSet(0);
    formRef.current?.reset();
    onReset?.();
  };

  // Custom submission handler that includes title and category
  const { onSubmitAddPostForm, isFormLoading } =
    useOnSubmitAddPostFormWithSepAttachmentCol({
      mongoUser,
      col,
      updatingPost,
      files: files.length > 0 ? files : null,
      tipTapInputContent,
      expirationPeriod: null, // Store items don't have expiration
      scheduleAt: null, // Store items don't have scheduling
      price,
      // Custom data for store items
      customData: {
        title,
        category,
      },
      onSuccess: ({ res, formData, mode }) => {
        // Reset form and files after successful submission
        if (mode === "add") {
          resetForm();
        }

        if (onCustomSuccess) {
          onCustomSuccess({ res, formData, mode, files, tipTapInputContent });
          return;
        }

        router.back();
        toastSet({
          isOpen: true,
          title: `${t("storeItem")} ${
            mode === "add" ? t("created") : t("updated")
          }`,
        });
      },
      onError: (error) => {
        console.error("Form submission error:", error);
        toastSet({
          isOpen: true,
          title: error?.message || "Error occurred",
          text:
            typeof error === "string"
              ? error
              : error?.message || "An unexpected error occurred",
        });
      },
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (customOnSubmit) {
      await customOnSubmit({
        files,
        tipTapInputContent,
        title,
        category,
        price,
      });
      resetForm();
      return;
    }
    onSubmitAddPostForm(e);
  };

  return (
    <>
      <PostsLoader
        {...{
          isLoading: isFormLoading,
          className: "w40 h40 poa left-[46.5%] t100",
        }}
      />

      <form
        className={`por f wf py15 ${isFormLoading ? "pen op5" : ""}`}
        ref={formRef}
        onSubmit={handleSubmit}
      >
        {/* FORM HEADER */}
        <PostPriceFormLabel />

        {/* Title Field */}
        <div className="fc g5 wf mb15">
          <label className="text-sm font-medium text-foreground">
            {t("storeItemTitle")}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("storeItemTitle")}
            className="w-full p10 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            required
          />
        </div>

        {/* Category Field */}
        <div className="fc g5 wf mb15">
          <label className="text-sm font-medium text-foreground">
            {t("storeItemCategory")}
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder={t("storeItemCategory")}
            className="w-full p10 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <AddFilesPreview {...{ files, filesSet }} />

        <TipTapInput
          settingsPosition="bottom"
          name="text"
          defaultValue={updatingPost?.text || ""}
          isSettingsVisible={isTipTapSettingsVisible}
          tipTapInputContent={tipTapInputContent}
          setTipTapInputContent={setTipTapInputContent}
          editorClassName="mih20"
          placeholder={placeholder || t("storeItemDescription")}
        />

        {!hideSubmitButton && (
          <div className="f jcsb wf">
            <AddFeedFormSubmitButton
              formRef={formRef}
              onSubmit={onSubmitAddPostForm}
              buttonText={submitBtnText || t("addToStore")}
              className={submitBtnClassName}
            />
          </div>
        )}

        {/* ICONS/SETTINGS */}
        <div className="mra f aic wf p15 g8">
          <AddFiles
            usePreview={false} // preview is on top
            files={files}
            filesSet={filesSet}
            isRequiredFiles={false}
            col={col}
          />
          <VideoRecorder
            onVideoRecorded={(videoFile) => {
              filesSet((prev) => [...prev, videoFile]);
            }}
          />
          <VaultFilesButton />
          <PostPriceButton />
          <TipTapSettings />
        </div>
      </form>
    </>
  );
}
