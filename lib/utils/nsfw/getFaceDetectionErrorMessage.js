/**
 * Returns user-friendly error messages for face detection and image quality issues
 * @param {string} errorType - The error type: NO_FACE_DETECTED, MINOR_DETECTED, SUNGLASSES_DETECTED, or LOW_QUALITY_IMAGE
 * @param {Function} t - Translation function
 * @returns {Object} An object with title and message properties
 */
export default function getFaceDetectionErrorMessage(errorType, t = null) {
  // If translation function is not provided, use raw strings
  const translate = (key, fallback) => (t ? t(key) : fallback);

  // Additional helper text that will be added to all specific error messages
  const additionalHelperText = translate(
    "ADD_ANOTHER_IMAGE",
    "Please upload another image or contact support if you think this is an error."
  );

  switch (errorType) {
    case "NO_FACE_DETECTED":
      return {
        title: translate("noFaceDetected", "No Face Detected"),
        message:
          translate(
            "couldntDetectFace",
            "We couldn't detect a face in this image. For profile photos, please upload an image where your face is clearly visible."
          ) +
          " " +
          additionalHelperText,
      };
    case "MINOR_DETECTED":
      return {
        title: translate("minorDetected", "Minor Detected"),
        message:
          translate(
            "imageContainsMinor",
            "This image appears to contain a minor (someone under 18 years old). For safety reasons, we don't allow images with minors."
          ) +
          " " +
          additionalHelperText,
      };
    case "SUNGLASSES_DETECTED":
      return {
        title: translate("sunglassesDetected", "Sunglasses Detected"),
        message:
          translate(
            "imageContainsSunglasses",
            "We detected sunglasses in this image. For profile photos, please upload an image where your eyes are clearly visible without sunglasses."
          ) +
          " " +
          additionalHelperText,
      };
    case "LOW_QUALITY_IMAGE":
      return {
        title: translate("lowQualityImage", "Low Quality Image Rejected"),
        message:
          translate(
            "imageTooLowQuality",
            "This image was rejected because the quality is too low. We only accept high-quality images that are clear, well-lit, and properly focused. Please upload a better quality image that isn't blurry, too dark, or overexposed."
          ) +
          " " +
          additionalHelperText,
      };
    default:
      return {
        title: translate("imageIssueDetected", "Image Issue Detected"),
        message: translate(
          "generalImageIssue",
          "There was an issue with your image. Please try uploading a different one."
        ),
      };
  }
}
