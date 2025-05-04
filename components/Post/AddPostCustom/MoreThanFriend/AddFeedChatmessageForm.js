"use client";

import { useRef, useState } from "react";
import TipTapInput from "../../AddPost/AddPostFormInput/TipTapInput";
import useAddFeedFormTipTapSettings from "./useAddFeedFormTipTapSettings";
import useAddFeedFormVaultFiles from "./useAddFeedFormVaultFiles";
import useAddFeedFormExpirationPeriod from "./useAddFeedFormExpirationPeriod";
import useAddFeedFormSchedule from "./useAddFeedFormSchedule";
import useAddFeedFormPostPrice from "./useAddFeedFormPostPrice";
import AddFiles from "../../../Cloudinary/AddFiles";
import AddFilesPreview from "@/components/Cloudinary/AddFilesPreview";
import AddFeedFormSubmitButton from "./AddFeedFormSubmitButton";
import useOnSubmitAddPostFormWithSepAttachmentCol from "../../AddPost/useOnSubmitAddPostFormWithSepAttachmentCol";
import { useRouter } from "next/navigation";
import { FEEDS_ROUTE } from "@/lib/utils/constants";
import PostsLoader from "../../Posts/PostsLoader";
import { useContext } from "@/components/Context/Context";
import VideoRecorder from "@/components/ui/shared/VideoRecorder/VideoRecorder";
import ReplyPreview from "@/components/Reply/ReplyPreview";
import AddTestFeedChatmessageFormButton from "./AddTestFeedChatmessageFormButton";
import { useTranslation } from "@/components/Context/TranslationContext";

// TODO !!!!! prevent empty messages from being submitted
export default function AddFeedChatmessageForm({
  col,
  mongoUser,
  updatingPost,
  onCustomSuccess,
  hideSettings = false,
  hideSubmitButton = false,
  hideExpirationPeriod = false,
  hideSchedule = false,
  customOnSubmit,
  submitBtnClassName,
  onReset,
  placeholder,
  submitBtnText,
  replyTo,
  onCancelReply,
}) {
  const { t } = useTranslation();
  const router = useRouter();
  // Initialize files with existing attachments if updating
  const [files, filesSet] = useState(updatingPost?.files || []);
  const [tipTapInputContent, setTipTapInputContent] = useState(
    updatingPost?.text || ""
  );
  const [expirationPeriod, expirationPeriodSet] = useState(
    updatingPost?.expirationPeriod || null
  );
  const [scheduleAt, scheduleAtSet] = useState(
    updatingPost?.scheduleAt || null
  );
  const [price, priceSet] = useState(updatingPost?.price || 0);
  const { toastSet } = useContext();

  const { TipTapSettings, isTipTapSettingsVisible } =
    useAddFeedFormTipTapSettings();
  const { VaultFilesButton } = useAddFeedFormVaultFiles({
    filesSet,
    files,
    mongoUser,
  });
  const { ExpirationPeriodButton, ExpirationPeriodFormLabel } =
    useAddFeedFormExpirationPeriod({
      expirationPeriodSet,
      expirationPeriod,
      price,
    });
  const { ScheduleButton, ScheduleFormLabel } = useAddFeedFormSchedule({
    scheduleAtSet,
    scheduleAt,
  });
  const { PostPriceButton, PostPriceFormLabel } = useAddFeedFormPostPrice({
    priceSet,
    price,
    expirationPeriod,
  });
  const formRef = useRef(null);

  const resetForm = () => {
    filesSet([]);
    setTipTapInputContent("");
    expirationPeriodSet(null);
    scheduleAtSet(null);
    priceSet(0);
    formRef.current?.reset();
    onReset?.();
  };

  const { onSubmitAddPostForm, isFormLoading } =
    useOnSubmitAddPostFormWithSepAttachmentCol({
      mongoUser,
      col,
      updatingPost,
      files: files.length > 0 ? files : null,
      tipTapInputContent,
      expirationPeriod,
      scheduleAt,
      price,
      onSuccess: ({ res, formData, mode }) => {
        // Reset form and files after successful submission
        if (mode === "add") {
          resetForm();
        }

        if (onCustomSuccess) {
          onCustomSuccess({ res, formData, mode, files, tipTapInputContent });
          return;
        }

        router.push(`${FEEDS_ROUTE}/${res?._id}`);
        toastSet({
          isOpen: true,
          title: `${t("postName")} ${
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
        expirationPeriod,
        scheduleAt,
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
        {/* Reply preview */}
        {replyTo && <ReplyPreview {...{ replyTo, onCancelReply }} />}

        {/* FORM HEADER */}

        {!hideExpirationPeriod && <ExpirationPeriodFormLabel />}
        {!hideSchedule && <ScheduleFormLabel />}
        <PostPriceFormLabel />

        <AddFilesPreview {...{ files, filesSet }} />

        <TipTapInput
          settingsPosition="bottom"
          name="text"
          defaultValue={updatingPost?.text || ""}
          isSettingsVisible={isTipTapSettingsVisible}
          tipTapInputContent={tipTapInputContent}
          setTipTapInputContent={setTipTapInputContent}
          editorClassName="mih20"
          placeholder={placeholder || t("composePost")}
        />

        {!hideSubmitButton && (
          <div className="f jcsb wf">
            <AddFeedFormSubmitButton
              formRef={formRef}
              onSubmit={onSubmitAddPostForm}
              buttonText={
                scheduleAt ? t("schedule") : submitBtnText || t("post")
              }
              className={submitBtnClassName}
            />
          </div>
        )}

        {/* // * ICONS/SETTINGS */}
        <div className="mra f aic wf p15 g8">
          <AddFiles
            usePreview={false} // * preview is on top
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
          {!hideExpirationPeriod && <ExpirationPeriodButton />}
          {!hideSchedule && <ScheduleButton />}
          <TipTapSettings />

          {/* // ! Test posts button */}
          {mongoUser?.isDev && (
            <AddTestFeedChatmessageFormButton {...{ mongoUser, col }} />
          )}
        </div>
      </form>
    </>
  );
}
