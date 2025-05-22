/**
 * Utility function to get user-friendly error messages for face detection issues
 * @param {string} errorCode - The error code from face detection
 * @returns {Object} Object containing title and message for the error
 */
export default function getFaceDetectionErrorMessage(errorCode) {
  switch (errorCode) {
    case "NO_FACE_DETECTED":
      return {
        title: "No Face Detected",
        message:
          "We couldn't detect any faces in this image. Please upload an image that clearly shows your face.",
      };
    case "MINOR_DETECTED":
      return {
        title: "Age Restriction",
        message:
          "This image appears to contain someone under 18 years old. For safety reasons, we don't allow images of minors.",
      };
    case "SUNGLASSES_DETECTED":
      return {
        title: "Sunglasses Detected",
        message:
          "Please upload an image where your eyes are clearly visible without sunglasses.",
      };
    case "NSFW_DETECTED":
      return {
        title: "Inappropriate Content",
        message:
          "This image contains content that violates our community guidelines. Please upload an appropriate image.",
      };
    default:
      return {
        title: "Image Not Acceptable",
        message:
          "This image doesn't meet our requirements. Please try uploading a different image.",
      };
  }
}
