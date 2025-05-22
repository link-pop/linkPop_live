"use client";

import axios from "axios";
import {
  EROTICA_THRESHOLD,
  WEAPONS_THRESHOLD,
  DRUGS_THRESHOLD,
  OFFENSIVE_THRESHOLD,
  MINOR_THRESHOLD,
  SUNGLASSES_THRESHOLD,
  FACE_DETECTION_ENABLED,
} from "@/lib/utils/constants";
import isNSFWAPIResponseLimitReached from "@/lib/utils/nsfw/isNSFWAPIResponseLimitReached";
import isNSFWAPILimitReached from "@/lib/utils/nsfw/isNSFWAPILimitReached";

export default async function uploadFilesToCloudinary(
  files,
  uploadedFrom,
  relatedPostId = null,
  options = {}
) {
  if (!files) return;

  // Handle the special case for cropped images
  const isCroppedImage = options.isCroppedImage || false;
  const originalFileId = options.originalFileId || null;
  // If skipNSFWCheck is true, skip the NSFW content check
  const skipNSFWCheck = options.skipNSFWCheck || false;
  // Check if we're uploading profile or cover images (stricter moderation)
  const isProfileOrCoverImage =
    uploadedFrom === "users" || uploadedFrom === "landingpages";
  // Check if face detection should be enforced for this upload (e.g. profile photos)
  const enforceFaceDetection = options.enforceFaceDetection || false;
  // Check if minor detection should be enforced (blocks images with minors)
  const blockMinors = options.blockMinors || false;
  // Check if sunglasses detection should be enforced (blocks images with sunglasses)
  const blockSunglasses = options.blockSunglasses || false;

  // Process files sequentially to allow NSFW checking
  const serverUploadedFiles = [];

  for (const file of files) {
    try {
      // * 1: if fileUrl exists in file =>
      // file is already uploaded to cloudinary =>
      // no need for uploading =>
      // return info about already uploaded file
      if (file?.fileUrl) {
        serverUploadedFiles.push({
          fileUrl: file.fileUrl,
          fileName: file.fileName,
          fileType: file.fileType,
          fileBytes: file.fileBytes,
          fileId: file.fileId,
          uploadedFrom: file.uploadedFrom || uploadedFrom,
          relatedPostId: file.relatedPostId || relatedPostId,
          blurredUrl: file.blurredUrl || null,
          isCropped: isCroppedImage,
          originalFileId: isCroppedImage ? originalFileId : null,
          faces: file.faces || [],
          faceCount: file.faceCount || 0,
          hasMinor: file.hasMinor || false,
          hasSunglasses: file.hasSunglasses || false,
          // Include NSFW data (with default safe values if not present)
          nudity: file.nudity || {},
          rawResponse: file.rawResponse || {},
          isSafe: file.isSafe !== undefined ? file.isSafe : true,
          eroticaScore: file.eroticaScore || 0,
          weaponsScore: file.weaponsScore || 0,
          alcoholScore: file.alcoholScore || 0,
          drugsScore: file.drugsScore || 0,
          offensiveScore: file.offensiveScore || 0,
          suggestiveClasses: file.suggestiveClasses || {},
          contextClasses: file.contextClasses || {},
        });
        continue;
      }

      // * 2: Check for NSFW content if it's an image and we're not skipping the check
      const resourceType = file.type.startsWith("video") ? "video" : "image";

      if (resourceType === "image" && !skipNSFWCheck) {
        // Convert the image to base64 for NSFW check
        const base64Image = await fileToBase64(file);

        try {
          // Call our NSFW check API
          const response = await fetch("/api/nsfw-check", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              imageBase64: base64Image,
              customThresholds: {
                eroticaThreshold: EROTICA_THRESHOLD,
                minorThreshold: MINOR_THRESHOLD,
                sunglassesThreshold: SUNGLASSES_THRESHOLD,
                faceDetectionEnabled: FACE_DETECTION_ENABLED,
              },
              isCroppedImage: isCroppedImage, // Pass whether this is a cropped image
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error("NSFW check failed:", errorData.error);

            // Check if this is an API limit error - proceed with upload if limits are reached
            const isApiLimitReached = isNSFWAPIResponseLimitReached(errorData);

            // Check if this is an unsupported format error
            const isUnsupportedFormat =
              errorData.error &&
              typeof errorData.error === "string" &&
              (errorData.error.includes("format might not be supported") ||
                errorData.error.includes("Image could not be read"));

            // If API limits reached, log warning and continue with upload
            if (isApiLimitReached) {
              console.warn(
                "NSFW check API limits reached, proceeding with upload anyway"
              );
              // Continue with upload - don't throw error to stop the process
            }
            // If format is not supported, block the upload
            else if (isUnsupportedFormat) {
              console.error(
                "Unsupported image format detected, blocking upload"
              );
              throw {
                message: "UNSUPPORTED_FORMAT",
                error: errorData.error,
              };
            }
            // For profile/cover images with other errors, throw an error to prevent upload
            else if (isProfileOrCoverImage) {
              throw {
                message: "NSFW_DETECTED",
                scores: {
                  // Legacy score for backward compatibility
                  nudityScore: 0,
                  // Remaining score from user request
                  eroticaScore: 0,
                  // Additional content scores
                  weaponsScore: 0,
                  alcoholScore: 0,
                  drugsScore: 0,
                  offensiveScore: 0,
                  // Empty classes
                  suggestiveClasses: {},
                  contextClasses: {},
                },
              };
            }
          }

          const nsfwResult = await response.json();

          // Block upload for any image if isSafe is false
          if (nsfwResult.isSafe === false) {
            // Instead of blocking all NSFW content, just log a warning
            console.warn("NSFW content detected but will be allowed:", {
              eroticaScore: nsfwResult.eroticaScore || 0,
              weaponsScore: nsfwResult.weaponsScore || 0,
              alcoholScore: nsfwResult.alcoholScore || 0,
              drugsScore: nsfwResult.drugsScore || 0,
              offensiveScore: nsfwResult.offensiveScore || 0,
            });

            // Do NOT throw an error here - allow the upload to continue
          }

          // Block upload for any image if a minor is detected
          if (nsfwResult.hasMinor === true) {
            throw {
              message: "MINOR_DETECTED",
              scores: {
                nudityScore: nsfwResult.nudityScore || 0,
                eroticaScore: nsfwResult.eroticaScore || 0,
                weaponsScore: nsfwResult.weaponsScore || 0,
                alcoholScore: nsfwResult.alcoholScore || 0,
                drugsScore: nsfwResult.drugsScore || 0,
                offensiveScore: nsfwResult.offensiveScore || 0,
                suggestiveClasses: nsfwResult.suggestiveClasses || {},
                contextClasses: nsfwResult.contextClasses || {},
              },
              faces: nsfwResult.faces || [],
              faceCount: nsfwResult.faceCount || 0,
              hasMinor: true,
              hasSunglasses: nsfwResult.hasSunglasses || false,
              imageBase64: base64Image,
            };
          }

          // Enhanced decision logic using reduced set of thresholds
          // Only check for specific content types requested
          const hasErotica = nsfwResult.eroticaScore >= EROTICA_THRESHOLD;

          // Check for other problematic content
          const hasOtherProblematicContent =
            nsfwResult.weaponsScore > WEAPONS_THRESHOLD ||
            nsfwResult.drugsScore > DRUGS_THRESHOLD ||
            nsfwResult.offensiveScore > OFFENSIVE_THRESHOLD;

          // For profile/cover images, use stricter rules
          const hasInappropriateContent =
            hasErotica || hasOtherProblematicContent;

          // Check face detection requirements
          const hasFaceDetectionError =
            (enforceFaceDetection && nsfwResult.faceCount === 0) ||
            (blockMinors && nsfwResult.hasMinor) ||
            (blockSunglasses && nsfwResult.hasSunglasses);

          // Only block uploads in two cases:
          // 1. For profile/cover images with inappropriate content or face detection errors
          // 2. For ANY image with minors detected
          if (
            isProfileOrCoverImage &&
            (hasInappropriateContent || hasFaceDetectionError)
          ) {
            let errorMessage = "NSFW_DETECTED";

            // Customize error message based on what was detected
            if (nsfwResult.faceCount === 0 && enforceFaceDetection) {
              errorMessage = "NO_FACE_DETECTED";
            } else if (nsfwResult.hasMinor && blockMinors) {
              errorMessage = "MINOR_DETECTED";
            } else if (nsfwResult.hasSunglasses && blockSunglasses) {
              errorMessage = "SUNGLASSES_DETECTED";
            }

            throw {
              message: errorMessage,
              scores: {
                // Legacy score for backward compatibility
                nudityScore: nsfwResult.nudityScore || 0,
                // Remaining score from user request
                eroticaScore: nsfwResult.eroticaScore || 0,
                // Additional content scores
                weaponsScore: nsfwResult.weaponsScore || 0,
                alcoholScore: nsfwResult.alcoholScore || 0,
                drugsScore: nsfwResult.drugsScore || 0,
                offensiveScore: nsfwResult.offensiveScore || 0,
                // Include detailed classes
                suggestiveClasses: nsfwResult.suggestiveClasses || {},
                contextClasses: nsfwResult.contextClasses || {},
              },
              // Face detection results
              faces: nsfwResult.faces || [],
              faceCount: nsfwResult.faceCount || 0,
              hasMinor: nsfwResult.hasMinor || false,
              hasSunglasses: nsfwResult.hasSunglasses || false,
              imageBase64: base64Image, // Pass the image for display in alert
            };
          }

          // Store face detection data for later use
          file.faces = nsfwResult.faces || [];
          file.faceCount = nsfwResult.faceCount || 0;
          file.hasMinor = nsfwResult.hasMinor || false;
          file.hasSunglasses = nsfwResult.hasSunglasses || false;

          // Store NSFW data for database storage
          file.nudity = nsfwResult.nudity || {};
          file.rawResponse = nsfwResult.rawResponse || {};
          file.isSafe = nsfwResult.isSafe;

          // Store individual NSFW scores
          file.eroticaScore = nsfwResult.eroticaScore || 0;
          file.weaponsScore = nsfwResult.weaponsScore || 0;
          file.alcoholScore = nsfwResult.alcoholScore || 0;
          file.drugsScore = nsfwResult.drugsScore || 0;
          file.offensiveScore = nsfwResult.offensiveScore || 0;
          file.suggestiveClasses = nsfwResult.suggestiveClasses || {};
          file.contextClasses = nsfwResult.contextClasses || {};

          // Log face detection data for debugging
          console.log(`NSFW check for file: ${file.name || "unknown"}`);
          console.log(
            `faceCount: ${file.faceCount}, hasMinor: ${file.hasMinor}, hasSunglasses: ${file.hasSunglasses}`
          );
        } catch (error) {
          // If we detect NSFW content, face-related issues, or unsupported format, block the upload
          if (
            [
              "NSFW_DETECTED",
              "NO_FACE_DETECTED",
              "MINOR_DETECTED",
              "SUNGLASSES_DETECTED",
              "UNSUPPORTED_FORMAT",
            ].includes(error.message)
          ) {
            throw error;
          }
          // Check if error message contains information about unsupported format
          if (
            error.message &&
            typeof error.message === "string" &&
            (error.message.includes("format might not be supported") ||
              error.message.includes("Image could not be read"))
          ) {
            console.error(
              "Unsupported image format detected in error message, blocking upload"
            );
            throw {
              message: "UNSUPPORTED_FORMAT",
              error: error.message,
            };
          }
          // Check if this is an API limit error - proceed with upload if limits are reached
          if (isNSFWAPILimitReached(error.message)) {
            console.warn(
              "NSFW check API limits reached, proceeding with upload anyway"
            );
            // Continue with upload - don't throw error to stop the process
          } else {
            // For other errors in non-profile images, just log and continue
            console.error("NSFW check error:", error);
          }
        }
      }

      // * 3: Upload to Cloudinary if NSFW check passed or was skipped
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET_NAME
      );

      // Add folder information for cropped images
      if (isCroppedImage) {
        formData.append("folder", "cropped");
      }

      let response;
      // For images, we'll create a blurred version
      if (resourceType === "image") {
        response = await axios.post(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        // After uploading the original image, create a blurred version
        const publicId = response.data.public_id;

        // Create a blurred, minified transformation URL
        // w_100,h_100 - resize to 100x100
        // e_blur:800 - apply blur effect with strength 800
        const blurredUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_300,h_300,c_fill,e_blur:700/${publicId}`;

        // Add the blurred URL to the response
        response.data.blurred_url = blurredUrl;
        response.data.is_cropped = isCroppedImage;
        response.data.original_file_id = isCroppedImage ? originalFileId : null;
      } else {
        // For videos, upload and create a blurred preview version
        response = await axios.post(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        // After uploading the original video, create a blurred preview
        const publicId = response.data.public_id;

        // Create a blurred, shorter preview URL for the video
        // eo_10p - extract only first 10% of the video
        // e_blur:300 - apply moderate blur effect
        // q_auto:low - lower quality to reduce size
        const blurredUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/eo_100p,e_blur:500,q_auto:low/${publicId}`;

        // Add the blurred URL to the response
        response.data.blurred_url = blurredUrl;
        response.data.is_cropped = isCroppedImage;
        response.data.original_file_id = isCroppedImage ? originalFileId : null;
      }

      // Process the response
      const {
        secure_url,
        original_filename,
        format,
        bytes,
        public_id,
        resource_type,
        blurred_url,
        is_cropped,
        original_file_id,
      } = response.data;

      // Check and log the face detection data from the file object
      console.log(
        `Face detection data for ${original_filename || "unknown file"}:`
      );
      console.log(
        `faceCount: ${file.faceCount || 0}, hasMinor: ${
          file.hasMinor || false
        }, hasSunglasses: ${file.hasSunglasses || false}`
      );

      serverUploadedFiles.push({
        fileUrl: secure_url,
        fileName: original_filename,
        fileType: resource_type === "video" ? "video" : format,
        fileBytes: bytes,
        fileId: public_id,
        uploadedFrom: uploadedFrom,
        relatedPostId: relatedPostId,
        blurredUrl: blurred_url || null,
        isCropped: is_cropped || false,
        originalFileId: original_file_id || null,
        faceCount: file.faceCount || 0,
        hasMinor: file.hasMinor || false,
        hasSunglasses: file.hasSunglasses || false,
        // Include NSFW data
        nudity: file.nudity || {},
        rawResponse: file.rawResponse || {},
        isSafe: file.isSafe !== undefined ? file.isSafe : true,
        eroticaScore: file.eroticaScore || 0,
        weaponsScore: file.weaponsScore || 0,
        alcoholScore: file.alcoholScore || 0,
        drugsScore: file.drugsScore || 0,
        offensiveScore: file.offensiveScore || 0,
        suggestiveClasses: file.suggestiveClasses || {},
        contextClasses: file.contextClasses || {},
      });
    } catch (error) {
      // Special handling for detected issues in profile/cover images or unsupported formats
      if (
        [
          "NSFW_DETECTED",
          "NO_FACE_DETECTED",
          "MINOR_DETECTED",
          "SUNGLASSES_DETECTED",
          "UNSUPPORTED_FORMAT",
        ].includes(error.message)
      ) {
        throw error; // Pass the entire error object with additional data
      }
      console.error("Error processing file:", error);
      // You might want to handle this differently depending on your requirements
      // For now, we'll continue with other files but skip the problematic one
    }
  }

  return serverUploadedFiles;
}

// Helper function to convert File object to base64
async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}
