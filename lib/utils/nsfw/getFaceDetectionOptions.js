/**
 * Utility function to get face detection options based on upload type
 * @param {string} uploadType - The type of upload (e.g., 'profile', 'cover', 'post', etc.)
 * @returns {Object} Object containing face detection options
 */
export default function getFaceDetectionOptions(uploadType) {
  // Default options - no face detection requirements
  const defaultOptions = {
    enforceFaceDetection: false,
    blockMinors: false,
    blockSunglasses: false,
  };

  // For profile photos, enforce face detection and block sunglasses
  if (uploadType === "profile") {
    return {
      enforceFaceDetection: true, // Must have a face
      blockMinors: true, // No minors allowed
      blockSunglasses: true, // No sunglasses allowed
    };
  }

  // For cover photos, only block minors but don't require face
  if (uploadType === "cover") {
    return {
      enforceFaceDetection: false, // Doesn't need to have a face
      blockMinors: true, // No minors allowed
      blockSunglasses: false, // Sunglasses are allowed
    };
  }

  // For verification photos, require face and block sunglasses
  if (uploadType === "verification") {
    return {
      enforceFaceDetection: true, // Must have a face
      blockMinors: false, // Minors are allowed (for age verification)
      blockSunglasses: true, // No sunglasses allowed
    };
  }

  // For other types of uploads, use default settings
  return defaultOptions;
}
