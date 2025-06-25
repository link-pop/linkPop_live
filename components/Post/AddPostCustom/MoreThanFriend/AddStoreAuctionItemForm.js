"use client";

import { useRef, useState } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";
import TipTapInput from "@/components/Post/AddPost/AddPostFormInput/TipTapInput";
import useAddFeedFormTipTapSettings from "@/components/Post/AddPostCustom/MoreThanFriend/useAddFeedFormTipTapSettings";
import useAddFeedFormVaultFiles from "@/components/Post/AddPostCustom/MoreThanFriend/useAddFeedFormVaultFiles";
import AddFiles from "@/components/Cloudinary/AddFiles";
import AddFilesPreview from "@/components/Cloudinary/AddFilesPreview";
import AddFeedFormSubmitButton from "@/components/Post/AddPostCustom/MoreThanFriend/AddFeedFormSubmitButton";
import useOnSubmitAddPostFormWithSepAttachmentCol from "@/components/Post/AddPost/useOnSubmitAddPostFormWithSepAttachmentCol";
import { useRouter } from "next/navigation";
import PostsLoader from "@/components/Post/Posts/PostsLoader";
import { useContext } from "@/components/Context/Context";
import VideoRecorder from "@/components/ui/shared/VideoRecorder/VideoRecorder";
import { SmartDatetimeInput } from "@/components/ui/shared/SmartDatetimeInput/SmartDatetimeInput";
import Input from "@/components/ui/shared/Input/Input";

export default function AddStoreAuctionItemForm({
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
  const [auctionStartPrice, setAuctionStartPrice] = useState(
    updatingPost?.auctionStartPrice || 1
  );
  const [auctionStartTime, setAuctionStartTime] = useState(
    updatingPost?.auctionStartTime || new Date()
  );
  const [auctionEndTime, setAuctionEndTime] = useState(
    updatingPost?.auctionEndTime || null
  );
  const [auctionMinBidIncrement, setAuctionMinBidIncrement] = useState(
    updatingPost?.auctionMinBidIncrement || 1
  );
  const [auctionBuyNowPrice, setAuctionBuyNowPrice] = useState(
    updatingPost?.auctionBuyNowPrice || ""
  );
  const [auctionReservePrice, setAuctionReservePrice] = useState(
    updatingPost?.auctionReservePrice || ""
  );
  const { toastSet } = useContext();

  const { TipTapSettings, isTipTapSettingsVisible } =
    useAddFeedFormTipTapSettings();
  const { VaultFilesButton } = useAddFeedFormVaultFiles({
    filesSet,
    files,
    mongoUser,
  });

  const formRef = useRef(null);

  const resetForm = () => {
    filesSet([]);
    setTipTapInputContent("");
    setTitle("");
    setCategory("");
    setAuctionStartPrice(1);
    setAuctionStartTime(new Date());
    setAuctionEndTime(null);
    setAuctionMinBidIncrement(1);
    setAuctionBuyNowPrice("");
    setAuctionReservePrice("");
    formRef.current?.reset();
    onReset?.();
  };

  // Custom submission handler for auction items
  const { onSubmitAddPostForm, isFormLoading } =
    useOnSubmitAddPostFormWithSepAttachmentCol({
      mongoUser,
      col,
      updatingPost,
      files: files.length > 0 ? files : null,
      tipTapInputContent,
      expirationPeriod: null,
      scheduleAt: null,
      price: auctionStartPrice, // Use start price as base price
      customData: {
        type: "auction",
        title,
        category,
        stock: 1, // Auction items are unique
        auctionStartPrice,
        auctionStartTime,
        auctionEndTime,
        auctionMinBidIncrement,
        auctionBuyNowPrice: auctionBuyNowPrice
          ? parseFloat(auctionBuyNowPrice)
          : null,
        auctionReservePrice: auctionReservePrice
          ? parseFloat(auctionReservePrice)
          : null,
        auctionStatus: "pending",
        auctionCurrentBid: {
          amount: 0,
          bidderId: null,
          bidTime: null,
        },
        auctionBids: [],
        auctionWinnerId: null,
      },
      onSuccess: ({ res, formData, mode }) => {
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
          title: `${t("auctionItem")} ${
            mode === "add" ? t("created") : t("updated")
          }`,
        });
      },
      onError: (error) => {
        console.error("❌ Form submission error:", error);
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

  const validateAuctionDates = () => {
    const now = new Date();
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(now.getFullYear() + 1);

    if (!auctionStartTime || !auctionEndTime) {
      return "Auction start and end times are required";
    }

    const startTime = new Date(auctionStartTime);
    const endTime = new Date(auctionEndTime);

    // Allow start time to be up to 5 minutes in the past to account for form filling time
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    if (startTime < fiveMinutesAgo) {
      return (
        t("auctionStartTimeInPast") ||
        "Auction start time cannot be more than 5 minutes in the past"
      );
    }

    if (endTime <= startTime) {
      return "Auction end time must be after start time";
    }

    if (startTime > oneYearFromNow || endTime > oneYearFromNow) {
      return "Auction times cannot be more than 1 year in the future";
    }

    const minDuration = 60 * 60 * 1000; // 1 hour minimum
    if (
      endTime.getTime() - startTime.getTime() < minDuration &&
      !mongoUser?.isDev
    ) {
      return "Auction must run for at least 1 hour";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate auction start price
    if (!auctionStartPrice || auctionStartPrice < 0.01) {
      toastSet({
        isOpen: true,
        title: t("startPriceRequired"),
        text: t("auctionStartPriceValidation"),
      });
      return;
    }

    // Validate title
    if (!title?.trim()) {
      toastSet({
        isOpen: true,
        title: t("titleRequired"),
        text: t("auctionTitleRequired"),
      });
      return;
    }

    // Validate auction dates
    const dateError = validateAuctionDates();
    if (dateError) {
      toastSet({
        isOpen: true,
        title: t("invalidAuctionDates"),
        text: dateError,
      });
      return;
    }

    // Validate bid increment
    if (auctionMinBidIncrement < 0.01) {
      toastSet({
        isOpen: true,
        title: t("invalidBidIncrement"),
        text: t("bidIncrementValidation"),
      });
      return;
    }

    // Validate buy now price if provided
    if (
      auctionBuyNowPrice &&
      parseFloat(auctionBuyNowPrice) <= auctionStartPrice
    ) {
      toastSet({
        isOpen: true,
        title: t("invalidBuyNowPrice"),
        text: t("buyNowPriceValidation"),
      });
      return;
    }

    // Validate reserve price if provided
    if (
      auctionReservePrice &&
      parseFloat(auctionReservePrice) < auctionStartPrice
    ) {
      toastSet({
        isOpen: true,
        title: t("invalidReservePrice"),
        text: t("reservePriceValidation"),
      });
      return;
    }

    if (customOnSubmit) {
      await customOnSubmit({
        files,
        tipTapInputContent,
        title,
        category,
        auctionStartPrice,
        auctionStartTime,
        auctionEndTime,
        auctionMinBidIncrement,
        auctionBuyNowPrice,
        auctionReservePrice,
      });
      resetForm();
      return;
    }

    onSubmitAddPostForm(e);
  };

  return (
    <div className="px15">
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
        {/* Title Field */}
        <div className="fc g5 wf mb15">
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            label={t("auctionTitle")}
            name="title"
            required
          />
        </div>

        {/* Category Field */}
        <div className="fc g5 wf mb15">
          <Input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            label={t("auctionCategory")}
            name="category"
          />
        </div>

        {/* Auction Start Price */}
        <div className="fc g5 wf mb15">
          <Input
            type="number"
            min="0.01"
            step="0.01"
            value={auctionStartPrice}
            onChange={(e) =>
              setAuctionStartPrice(parseFloat(e.target.value) || 0)
            }
            label={t("auctionStartPrice")}
            name="auctionStartPrice"
            helperText={t("auctionStartPriceDescription")}
            required
          />
        </div>

        {/* Auction Start Time */}
        <div className="fc g5 wf mb15">
          <label className="text-sm font-medium text-foreground">
            {t("auctionStartTime")}
          </label>
          <div className="f aic g10 wf">
            <div className="flex-1">
              <SmartDatetimeInput
                value={auctionStartTime}
                onValueChange={setAuctionStartTime}
                placeholder={t("selectAuctionStartTime")}
                minDate={new Date()}
                maxDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)}
                required
              />
            </div>
            <button
              type="button"
              onClick={() => setAuctionStartTime(new Date())}
              className="px10 py8 bg-accent hover:bg-accent/80 text-accent-foreground rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
            >
              {t("now")}
            </button>
          </div>
        </div>

        {/* Auction End Time */}
        <div className="fc g5 wf mb15">
          <label className="text-sm font-medium text-foreground">
            {t("auctionEndTime")}
          </label>
          <div className="fc g10 wf">
            <div className="f aic g10 wf">
              <div className="flex-1">
                <SmartDatetimeInput
                  value={auctionEndTime}
                  onValueChange={setAuctionEndTime}
                  placeholder={t("selectAuctionEndTime")}
                  minDate={
                    auctionStartTime ? new Date(auctionStartTime) : new Date()
                  }
                  maxDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)}
                  required
                />
              </div>
              <div className="f aic g5">
                {/* // * DEV MODE ONLY: 30s */}
                {mongoUser?.isDev && (
                  <button
                    type="button"
                    onClick={() => {
                      const startTime = new Date(auctionStartTime);
                      const endTime = new Date(
                        startTime.getTime() + 1 * 30 * 1000
                      );
                      setAuctionEndTime(endTime);
                    }}
                    className="px10 py8 bg-accent hover:bg-accent/80 text-accent-foreground rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
                  >
                    30s
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const startTime = new Date(auctionStartTime);
                    const endTime = new Date(
                      startTime.getTime() + 7 * 24 * 60 * 60 * 1000
                    );
                    setAuctionEndTime(endTime);
                  }}
                  className="px10 py8 bg-muted hover:bg-muted/80 text-muted-foreground rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
                >
                  {t("oneWeek")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const startTime = new Date(auctionStartTime);
                    const endTime = new Date(
                      startTime.getTime() + 14 * 24 * 60 * 60 * 1000
                    );
                    setAuctionEndTime(endTime);
                  }}
                  className="px10 py8 bg-muted hover:bg-muted/80 text-muted-foreground rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
                >
                  {t("twoWeeks")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const startTime = new Date(auctionStartTime);
                    const endTime = new Date(startTime);
                    endTime.setMonth(startTime.getMonth() + 1);
                    setAuctionEndTime(endTime);
                  }}
                  className="px10 py8 bg-muted hover:bg-muted/80 text-muted-foreground rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
                >
                  {t("oneMonth")}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Minimum Bid Increment */}
        <div className="fc g5 wf mb15">
          <Input
            type="number"
            min="0.01"
            step="0.01"
            value={auctionMinBidIncrement}
            onChange={(e) =>
              setAuctionMinBidIncrement(parseFloat(e.target.value) || 1)
            }
            label={t("minBidIncrement")}
            name="auctionMinBidIncrement"
            helperText={t("minBidIncrementDescription")}
            required
          />
        </div>

        {/* Buy Now Price (Optional) */}
        <div className="fc g5 wf mb15">
          <Input
            type="number"
            min="0.01"
            step="0.01"
            value={auctionBuyNowPrice}
            onChange={(e) => setAuctionBuyNowPrice(e.target.value)}
            label={`${t("buyNowPrice")} (${t("optional")})`}
            name="auctionBuyNowPrice"
            helperText={t("buyNowPriceDescription")}
          />
        </div>

        {/* Reserve Price (Optional) */}
        <div className="fc g5 wf mb15">
          <Input
            type="number"
            min="0.01"
            step="0.01"
            value={auctionReservePrice}
            onChange={(e) => setAuctionReservePrice(e.target.value)}
            label={`${t("reservePrice")} (${t("optional")})`}
            name="auctionReservePrice"
            helperText={t("reservePriceDescription")}
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
          placeholder={placeholder || t("auctionDescription")}
        />

        {!hideSubmitButton && (
          <div className="f jcsb wf">
            <AddFeedFormSubmitButton
              formRef={formRef}
              onSubmit={onSubmitAddPostForm}
              buttonText={submitBtnText || t("createAuction")}
              className={submitBtnClassName}
              isLoading={isFormLoading}
            />
          </div>
        )}

        {/* ICONS/SETTINGS */}
        <div className="mra f aic wf p15 g8">
          <AddFiles
            usePreview={false}
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
          <TipTapSettings />
        </div>
      </form>
    </div>
  );
}
