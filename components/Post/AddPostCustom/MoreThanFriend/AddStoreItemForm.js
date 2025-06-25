"use client";

import { useRef, useState } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";
import TipTapInput from "@/components/Post/AddPost/AddPostFormInput/TipTapInput";
import useAddFeedFormTipTapSettings from "@/components/Post/AddPostCustom/MoreThanFriend/useAddFeedFormTipTapSettings";
import useAddFeedFormVaultFiles from "@/components/Post/AddPostCustom/MoreThanFriend/useAddFeedFormVaultFiles";
import useAddFeedFormPostPrice from "@/components/Post/AddPostCustom/MoreThanFriend/useAddFeedFormPostPrice";
import AddFiles from "@/components/Cloudinary/AddFiles";
import AddFilesPreview from "@/components/Cloudinary/AddFilesPreview";
import AddFeedFormSubmitButton from "@/components/Post/AddPostCustom/MoreThanFriend/AddFeedFormSubmitButton";
import useOnSubmitAddPostFormWithSepAttachmentCol from "@/components/Post/AddPost/useOnSubmitAddPostFormWithSepAttachmentCol";
import { useRouter } from "next/navigation";
import PostsLoader from "@/components/Post/Posts/PostsLoader";
import { useContext } from "@/components/Context/Context";
import VideoRecorder from "@/components/ui/shared/VideoRecorder/VideoRecorder";
import Input from "@/components/ui/shared/Input/Input";

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
  const [stock, setStock] = useState(updatingPost?.stock || 0);
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
    setStock(0);
    formRef.current?.reset();
    onReset?.();
  };

  // Custom submission handler that includes title, category, and stock
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
        stock,
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

    // Validate that price is greater than 1
    if (!price || price < 1) {
      toastSet({
        isOpen: true,
        title: t("priceRequired"),
        text: t("storeItemPriceValidation"),
      });
      return;
    }

    // Validate that title is provided
    if (!title?.trim()) {
      toastSet({
        isOpen: true,
        title: t("titleRequired"),
        text: t("storeItemTitleRequired"),
      });
      return;
    }

    // Validate that stock is provided and greater than 0
    if (stock < 0) {
      toastSet({
        isOpen: true,
        title: t("stockRequired"),
        text: t("storeItemStockValidation"),
      });
      return;
    }

    if (customOnSubmit) {
      await customOnSubmit({
        files,
        tipTapInputContent,
        title,
        category,
        price,
        stock,
      });
      resetForm();
      return;
    }
    onSubmitAddPostForm(e);
  };

  return (
    <div className="">
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
          <Input
            type="text"
            name="title"
            label={t("storeItemTitle")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("storeItemTitle")}
            required
          />
        </div>

        {/* Category Field */}
        <div className="fc g5 wf mb15">
          <Input
            type="text"
            name="category"
            label={t("storeItemCategory")}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder={t("storeItemCategory")}
          />
        </div>

        {/* Stock Field */}
        <div className="fc g5 wf mb15">
          <Input
            type="number"
            name="stock"
            label={t("storeItemStock")}
            min="0"
            step="1"
            value={stock}
            onChange={(e) => setStock(parseInt(e.target.value) || 0)}
            placeholder={t("storeItemStockPlaceholder")}
            helperText={t("storeItemStockDescription")}
            required
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
              isLoading={isFormLoading}
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
    </div>
  );
}
