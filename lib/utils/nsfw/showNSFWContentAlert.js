"use client";

import NSFWContentAlert from "@/components/ui/shared/NSFWContentAlert/NSFWContentAlert";

/**
 * Show appropriate alert dialogs for content moderation issues
 * @param {Object} error - The error object from content moderation
 * @param {Function} dialogSet - Function to set dialog state
 * @param {Function} setNsfwScores - Function to set NSFW scores state
 * @param {Function} setIsProcessing - Function to set processing state
 * @param {Function} t - Translation function (optional)
 */
export default function showNSFWContentAlert(
  error,
  dialogSet,
  setNsfwScores,
  setIsProcessing,
  t = null
) {
  // Helper function to get translations with fallback
  const translate = (key, fallback) => (t ? t(key) : fallback);

  // Set NSFW scores for debugging if available
  if (setNsfwScores && error.scores) {
    setNsfwScores(error.scores);
  }

  // Stop processing
  if (setIsProcessing) {
    setIsProcessing(false);
  }

  // Determine title and message based on error type
  let title = translate("contentModerationAlert", "Content Moderation Alert");
  let message = translate(
    "doesntMeetGuidelines",
    "This image doesn't meet our content guidelines. Please try uploading a different image."
  );

  // Additional helper text that will be added to all specific error messages
  const additionalHelperText = translate(
    "ADD_ANOTHER_IMAGE",
    "Please upload another image or contact support if you think this is an error."
  );

  if (error.message === "NSFW_DETECTED") {
    title = translate("inappropriateContent", "Inappropriate Content");
    message =
      translate(
        "contentViolatesGuidelines",
        "This image contains content that violates our community guidelines. Please upload an appropriate image."
      ) +
      " " +
      additionalHelperText;
  } else if (error.message === "MINOR_DETECTED") {
    title = translate("minorDetected", "Minor Detected");
    message =
      translate(
        "imageContainsMinor",
        "This image appears to contain a minor (someone under 18 years old). For safety reasons, we don't allow images with minors."
      ) +
      " " +
      additionalHelperText;
  } else if (error.message === "NO_FACE_DETECTED") {
    title = translate("noFaceDetected", "No Face Detected");
    message =
      translate(
        "couldntDetectFace",
        "We couldn't detect a face in this image. For profile photos, please upload an image where your face is clearly visible."
      ) +
      " " +
      additionalHelperText;
  } else if (error.message === "SUNGLASSES_DETECTED") {
    title = translate("sunglassesDetected", "Sunglasses Detected");
    message =
      translate(
        "imageContainsSunglasses",
        "We detected sunglasses in this image. For profile photos, please upload an image where your eyes are clearly visible without sunglasses."
      ) +
      " " +
      additionalHelperText;
  } else if (error.message === "LOW_QUALITY_IMAGE") {
    title = translate("lowQualityImage", "Low Quality Image Rejected");
    message =
      translate(
        "imageTooLowQuality",
        "This image was rejected because the quality is too low. We only accept high-quality images that are clear, well-lit, and properly focused. Please upload a better quality image."
      ) +
      " " +
      additionalHelperText;

    // If we have a quality score, include it in the message
    if (error.imageQualityScore !== undefined) {
      const qualityPercent = Math.round(error.imageQualityScore * 100);
      const qualityMessage = t
        ? t("qualityScoreMessage", { percent: qualityPercent })
        : ` Your image scored ${qualityPercent}%, but we require at least 70% quality.`;

      message += qualityMessage;
    }
  }

  // Show dialog
  dialogSet({
    isOpen: true,
    title: title,
    description: message,
    showBtns: true,
    primaryBtn: {
      text: translate("ok", "OK"),
      onClick: () => dialogSet({ isOpen: false }),
    },
  });
}
