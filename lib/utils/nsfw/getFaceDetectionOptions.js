/**
 * Returns appropriate face detection and image quality check options based on upload type
 * @param {string} uploadType - The type of upload ("profile", "cover", or other)
 * @returns {Object} Configuration options for face detection and quality checks
 */
export default function getFaceDetectionOptions(uploadType) {
  // Default options - quality check enabled for all images
  const options = {
    enforceFaceDetection: false,
    blockMinors: true, // Always block minors for safety
    blockSunglasses: false,
    enforceQualityCheck: true, // Always enforce quality checks by default
  };

  // For profile images - enforce face detection and no sunglasses
  if (uploadType === "profile") {
    options.enforceFaceDetection = true;
    options.blockSunglasses = true;
  }

  // For cover images - only block minors and NSFW, but don't enforce other checks
  if (uploadType === "cover") {
    options.enforceFaceDetection = false;
    options.blockSunglasses = false;
    options.enforceQualityCheck = false;
  }

  return options;
}
