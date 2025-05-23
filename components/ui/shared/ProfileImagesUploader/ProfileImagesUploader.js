"use client";

// ! code start ProfileImagesUploader
import { useState, useEffect } from "react";
import ProfileImages from "@/app/my/settings/profile/ProfileImages";
import { useContext } from "@/components/Context/Context";
import ImageCropper from "@/components/ui/shared/ImageCropper/ImageCropper";
import getCroppedImg from "@/lib/utils/files/getCroppedImg";
import uploadFilesToCloudinary from "@/components/Cloudinary/uploadFilesToCloudinary";
import { useTranslation } from "@/components/Context/TranslationContext";
import handleNSFWAPILimitError from "@/lib/utils/nsfw/handleNSFWAPILimitError";
import showNSFWContentAlert from "@/lib/utils/nsfw/showNSFWContentAlert";
import getFaceDetectionOptions from "@/lib/utils/nsfw/getFaceDetectionOptions";
import getFaceDetectionErrorMessage from "@/lib/utils/nsfw/getFaceDetectionErrorMessage";
import { SITE2 } from "@/config/env";

export default function ProfileImagesUploader({
  profileImage,
  coverImage,
  setProfileImage,
  setCoverImage,
  mongoUser,
  originalProfileImage: propOriginalProfileImage,
  originalCoverImage: propOriginalCoverImage,
  setOriginalProfileImage: setParentOriginalProfileImage,
  setOriginalCoverImage: setParentOriginalCoverImage,
  isLandingPage = false,
  uploadFolder = "users", // Default to "users", can be set to "landingpages"
}) {
  const { toastSet, dialogSet } = useContext();
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [nsfwScores, setNsfwScores] = useState(null);

  // State for original images (used for re-cropping)
  const [originalProfileImage, setOriginalProfileImage] = useState(
    propOriginalProfileImage || ""
  );
  const [originalCoverImage, setOriginalCoverImage] = useState(
    propOriginalCoverImage || ""
  );

  // Update original image state if props change
  useEffect(() => {
    if (propOriginalProfileImage) {
      setOriginalProfileImage(propOriginalProfileImage);
    }
    if (propOriginalCoverImage) {
      setOriginalCoverImage(propOriginalCoverImage);
    }
  }, [propOriginalProfileImage, propOriginalCoverImage]);

  // Create an adapted object to simulate a visited user or landing page
  const adaptedObject = {
    profileImage: profileImage,
    coverImage: coverImage,
    name: isLandingPage ? "New Landing Page" : mongoUser?.name || "",
    isOwner: true,
  };

  // Update parent component's original image state if available
  const updateParentOriginalImage = (type, url) => {
    if (setParentOriginalProfileImage && type === "profileImage") {
      setParentOriginalProfileImage(url);
    } else if (setParentOriginalCoverImage && type === "coverImage") {
      setParentOriginalCoverImage(url);
    }
  };

  // Validate that only image files are uploaded
  const validateImageFile = (file) => {
    if (!file) return false;

    // Check if it's a valid image file
    if (!file.type.startsWith("image/")) {
      return false;
    }

    // Allowed image formats - include GIF for SITE2
    const allowedFormats = SITE2
      ? ["image/jpeg", "image/png", "image/webp", "image/gif"]
      : ["image/jpeg", "image/png", "image/webp"];

    if (!allowedFormats.includes(file.type)) {
      return false;
    }

    return true;
  };

  // Handle image changes from ProfileImages component
  const handleImageChange = async (type, imageUrl) => {
    if (!imageUrl) {
      // If removing image
      if (type === "profileImage") {
        setProfileImage(null);
        setOriginalProfileImage(null);
        updateParentOriginalImage("profileImage", null);
      } else if (type === "coverImage") {
        setCoverImage(null);
        setOriginalCoverImage(null);
        updateParentOriginalImage("coverImage", null);
      }
      return;
    }

    // Store the original image URL
    if (type === "profileImage") {
      setOriginalProfileImage(imageUrl);
      updateParentOriginalImage("profileImage", imageUrl);
    } else if (type === "coverImage") {
      setOriginalCoverImage(imageUrl);
      updateParentOriginalImage("coverImage", imageUrl);
    }

    // Show the image cropper - happens now through onReCrop parameter in ProfileImages
  };

  // Show cropping dialog - this is now used both for initial crop and re-crop
  const showCropDialog = (type, imageUrl, files = null) => {
    // Validate file type if files are provided
    if (files && files.length > 0) {
      // Check if any of the files are not valid images
      const invalidFiles = files.filter((file) => !validateImageFile(file));

      if (invalidFiles.length > 0) {
        toastSet({
          isOpen: true,
          title: t("invalidFileType"),
          description: t("onlySpecificImageFormatsAllowed"),
          variant: "destructive",
        });
        return;
      }
    }

    const aspectRatio = type === "profileImage" ? 1 : 16 / 9; // Square for profile, 16:9 for cover
    const cropShape = type === "profileImage" ? "round" : "rect";

    dialogSet({
      className: "fixed inset-0 w-screen h-screen",
      contentClassName:
        "border-none max-w-full max-h-[100dvh] h-screen w-screen m-0 rounded-none overflow-hidden",
      isOpen: true,
      hasCloseIcon: false,
      // title: t("cropImage"),
      // Hide the default dialog buttons
      showBtns: false,
      comp: (
        <ImageCropper
          image={imageUrl}
          onCropComplete={(croppedAreaPixels) =>
            handleCropComplete(type, imageUrl, croppedAreaPixels, files)
          }
          onCancel={() => handleCancelCrop(type, files)}
          aspectRatio={aspectRatio}
          cropShape={cropShape}
        />
      ),
    });
  };

  // Handle cancellation of crop operation
  const handleCancelCrop = (type, files) => {
    // Close the dialog
    dialogSet({ isOpen: false });

    // Clear file input if it was a new file upload
    if (files) {
      // Clear the file input state
      if (type === "profileImage") {
        // Clear profileFiles in the parent ProfileImages component
        const profileImageInput = document.querySelector('input[type="file"]');
        if (profileImageInput) profileImageInput.value = "";
      } else if (type === "coverImage") {
        // Clear coverFiles in the parent ProfileImages component
        const coverImageInput = document.querySelectorAll('input[type="file"]');
        if (coverImageInput && coverImageInput.length > 1)
          coverImageInput[1].value = "";
      }
    }
  };

  // Handle crop completion
  const handleCropComplete = async (
    type,
    imageUrl,
    croppedAreaPixels,
    files = null
  ) => {
    try {
      setIsProcessing(true);

      // Close the dialog
      dialogSet({ isOpen: false });

      // Show loading toast
      toastSet({
        isOpen: true,
        title: t("processingImage"),
      });

      // Generate cropped image
      const croppedImageBlob = await getCroppedImg(imageUrl, croppedAreaPixels);

      if (!croppedImageBlob) {
        throw new Error("Failed to crop image");
      }

      // Create file from blob for upload
      const file = new File(
        [croppedImageBlob],
        `cropped_image_${Date.now()}.jpg`,
        {
          type: "image/jpeg",
        }
      );

      let uploadOptions = {
        isCroppedImage: true,
        isCoverImage: type === "coverImage", // Add flag to identify cover images
      };

      // If we have an original file that needs to be uploaded first, do that
      if (files && files.length > 0) {
        try {
          // Validate files are images
          const invalidFiles = files.filter((file) => !validateImageFile(file));
          if (invalidFiles.length > 0) {
            throw new Error("INVALID_FILE_TYPE");
          }

          // Get face detection options for the original upload
          const uploadType = type === "profileImage" ? "profile" : "cover";
          const faceDetectionOptions = getFaceDetectionOptions(uploadType);

          // First upload the original file
          const originalFiles = await uploadFilesToCloudinary(
            files,
            uploadFolder, // Use the specified folder
            null,
            {
              skipNSFWCheck: true, // Skip NSFW check for original file, we'll check the cropped version
              ...faceDetectionOptions, // Include face detection options
              isCoverImage: type === "coverImage", // Add flag to identify cover images
              t, // Pass translation function
            }
          );

          if (!originalFiles || originalFiles.length === 0) {
            throw new Error("Failed to upload original image");
          }

          // Set the original image URL
          const originalImageUrl = originalFiles[0].fileUrl;
          const originalFileId = originalFiles[0].fileId;

          // Store the original image based on type
          if (type === "profileImage") {
            setOriginalProfileImage(originalImageUrl);
            updateParentOriginalImage("profileImage", originalImageUrl);
          } else if (type === "coverImage") {
            setOriginalCoverImage(originalImageUrl);
            updateParentOriginalImage("coverImage", originalImageUrl);
          }

          // Add the original file ID to the options
          uploadOptions.originalFileId = originalFileId;
        } catch (error) {
          // Handle invalid file type error
          if (error.message === "INVALID_FILE_TYPE") {
            toastSet({
              isOpen: true,
              title: t("invalidFileType"),
              description: error.error || t("onlyImageFilesAllowed"),
              variant: "destructive",
            });
            setIsProcessing(false);
            return;
          }

          // Check if this was an NSFW detection error or other blocking errors
          if (
            ["NSFW_DETECTED", "MINOR_DETECTED", "UNSUPPORTED_FORMAT"].includes(
              error.message
            ) ||
            (type === "profileImage" &&
              [
                "LOW_QUALITY_IMAGE",
                "NO_FACE_DETECTED",
                "SUNGLASSES_DETECTED",
              ].includes(error.message))
          ) {
            showNSFWContentAlert(
              error,
              dialogSet,
              setNsfwScores,
              setIsProcessing,
              t
            );
            return;
          }

          // For coverImage, if error is not one of the blocking ones, show warning but continue
          if (
            type === "coverImage" &&
            [
              "LOW_QUALITY_IMAGE",
              "NO_FACE_DETECTED",
              "SUNGLASSES_DETECTED",
            ].includes(error.message)
          ) {
            // Show warning toast but continue with upload
            toastSet({
              isOpen: true,
              title: t
                ? t(getFaceDetectionErrorMessage(error.message).title)
                : getFaceDetectionErrorMessage(error.message).title,
              description:
                (t
                  ? t(getFaceDetectionErrorMessage(error.message).message)
                  : getFaceDetectionErrorMessage(error.message).message) +
                " " +
                t(
                  "allowedForCoverImages",
                  "However, we'll allow it for cover images."
                ),
              variant: "warning",
            });

            // Try to upload without these checks
            const bypassedOptions = {
              skipNSFWCheck: false,
              enforceFaceDetection: false,
              blockSunglasses: false,
              enforceQualityCheck: false,
              isCoverImage: true, // Add flag to identify cover images
              t, // Pass translation function
            };

            const originalFiles = await uploadFilesToCloudinary(
              files,
              uploadFolder,
              null,
              bypassedOptions
            );

            if (!originalFiles || originalFiles.length === 0) {
              throw new Error("Failed to upload original image");
            }

            const originalImageUrl = originalFiles[0].fileUrl;
            const originalFileId = originalFiles[0].fileId;

            setOriginalCoverImage(originalImageUrl);
            updateParentOriginalImage("coverImage", originalImageUrl);

            uploadOptions.originalFileId = originalFileId;
          } else {
            // Handle API limit errors with our utility function
            const updatedOptions = handleNSFWAPILimitError(error, toastSet, t);

            // If this is an API limit error, retry the upload with NSFW check bypassed
            if (updatedOptions.skipNSFWCheck) {
              try {
                // Get face detection options
                const uploadType =
                  type === "profileImage" ? "profile" : "cover";
                const faceDetectionOptions =
                  getFaceDetectionOptions(uploadType);

                // Retry upload with NSFW check bypassed but keep face detection options
                const originalFiles = await uploadFilesToCloudinary(
                  files,
                  uploadFolder,
                  null,
                  {
                    skipNSFWCheck: true,
                    ...faceDetectionOptions,
                    isCoverImage: type === "coverImage", // Add flag to identify cover images
                    t, // Pass translation function
                  }
                );

                if (!originalFiles || originalFiles.length === 0) {
                  throw new Error("Failed to upload original image");
                }

                // Set the original image URL
                const originalImageUrl = originalFiles[0].fileUrl;
                const originalFileId = originalFiles[0].fileId;

                // Store the original image based on type
                if (type === "profileImage") {
                  setOriginalProfileImage(originalImageUrl);
                  updateParentOriginalImage("profileImage", originalImageUrl);
                } else if (type === "coverImage") {
                  setOriginalCoverImage(originalImageUrl);
                  updateParentOriginalImage("coverImage", originalImageUrl);
                }

                // Add the original file ID to the options
                uploadOptions.originalFileId = originalFileId;
              } catch (retryError) {
                // If retry also fails, throw the error to be caught by the outer catch
                throw retryError;
              }
            } else {
              // If not an API limit error, rethrow
              throw error;
            }
          }
        }
      } else {
        // Extract the public_id from the existing image URL if no new original file
        const originalFileId = imageUrl.split("/").pop().split(".")[0];
        uploadOptions.originalFileId = originalFileId;
      }

      // Upload the cropped image
      try {
        // Get face detection options based on upload type
        const uploadType = type === "profileImage" ? "profile" : "cover";
        const faceDetectionOptions = getFaceDetectionOptions(uploadType);

        // For cover images, override certain options
        if (type === "coverImage") {
          faceDetectionOptions.enforceFaceDetection = false;
          faceDetectionOptions.blockSunglasses = false;
          faceDetectionOptions.enforceQualityCheck = false;
        }

        // Upload the cropped image with face detection options
        const uploadedFiles = await uploadFilesToCloudinary(
          [file],
          uploadFolder, // Use the specified folder
          null,
          {
            ...uploadOptions,
            ...faceDetectionOptions,
            t, // Pass translation function
          }
        );

        if (!uploadedFiles || uploadedFiles.length === 0) {
          throw new Error("Failed to upload cropped image");
        }

        const croppedImageUrl = uploadedFiles[0].fileUrl;

        // Set the cropped image
        if (type === "profileImage") {
          setProfileImage(croppedImageUrl);
        } else if (type === "coverImage") {
          setCoverImage(croppedImageUrl);
        }

        // Success toast
        toastSet({
          isOpen: true,
          title: t("imageCroppedAndSaved"),
        });
      } catch (error) {
        // Check if this is a blocking error for the specific image type
        if (
          ["NSFW_DETECTED", "MINOR_DETECTED", "UNSUPPORTED_FORMAT"].includes(
            error.message
          ) ||
          (type === "profileImage" &&
            [
              "NO_FACE_DETECTED",
              "SUNGLASSES_DETECTED",
              "LOW_QUALITY_IMAGE",
            ].includes(error.message))
        ) {
          // For NSFW content or low quality images, use the existing alert function
          showNSFWContentAlert(
            error,
            dialogSet,
            setNsfwScores,
            setIsProcessing,
            t
          );
          return;
        }

        // For coverImage with non-blocking errors, show warning but proceed
        if (
          type === "coverImage" &&
          [
            "NO_FACE_DETECTED",
            "SUNGLASSES_DETECTED",
            "LOW_QUALITY_IMAGE",
          ].includes(error.message)
        ) {
          // Show warning toast
          toastSet({
            isOpen: true,
            title: t
              ? t(getFaceDetectionErrorMessage(error.message).title)
              : getFaceDetectionErrorMessage(error.message).title,
            description:
              (t
                ? t(getFaceDetectionErrorMessage(error.message).message)
                : getFaceDetectionErrorMessage(error.message).message) +
              " " +
              t(
                "allowedForCoverImages",
                "However, we'll allow it for cover images."
              ),
            variant: "warning",
          });

          // Try to upload without these checks
          const bypassedOptions = {
            ...uploadOptions,
            skipNSFWCheck: false,
            enforceFaceDetection: false,
            blockSunglasses: false,
            enforceQualityCheck: false,
            isCoverImage: true,
            t, // Pass translation function
          };

          const uploadedFiles = await uploadFilesToCloudinary(
            [file],
            uploadFolder,
            null,
            bypassedOptions
          );

          if (!uploadedFiles || uploadedFiles.length === 0) {
            throw new Error("Failed to upload cropped image");
          }

          const croppedImageUrl = uploadedFiles[0].fileUrl;
          setCoverImage(croppedImageUrl);

          // Success toast
          toastSet({
            isOpen: true,
            title: t("imageCroppedAndSaved"),
          });
          setIsProcessing(false);
          return;
        }

        // Handle API limit errors with our utility function
        const bypassOptions = handleNSFWAPILimitError(
          error,
          toastSet,
          t,
          uploadOptions
        );

        // If this is an API limit error, retry the upload with NSFW check bypassed
        if (bypassOptions.skipNSFWCheck) {
          try {
            // Get face detection options
            const uploadType = type === "profileImage" ? "profile" : "cover";
            const faceDetectionOptions = getFaceDetectionOptions(uploadType);

            // For cover images, override certain options
            if (type === "coverImage") {
              faceDetectionOptions.enforceFaceDetection = false;
              faceDetectionOptions.blockSunglasses = false;
              faceDetectionOptions.enforceQualityCheck = false;
            }

            // Retry upload with NSFW check bypassed but keep face detection options
            const uploadedFiles = await uploadFilesToCloudinary(
              [file],
              uploadFolder,
              null,
              {
                ...bypassOptions,
                ...faceDetectionOptions,
                isCoverImage: type === "coverImage", // Add flag to identify cover images
                t, // Pass translation function
              }
            );

            if (!uploadedFiles || uploadedFiles.length === 0) {
              throw new Error("Failed to upload cropped image");
            }

            const croppedImageUrl = uploadedFiles[0].fileUrl;

            // Set the cropped image
            if (type === "profileImage") {
              setProfileImage(croppedImageUrl);
            } else if (type === "coverImage") {
              setCoverImage(croppedImageUrl);
            }

            // Success toast
            toastSet({
              isOpen: true,
              title: t("imageCroppedAndSaved"),
            });
          } catch (retryError) {
            // If retry also fails, throw the error to be caught by the outer catch
            throw retryError;
          }
        } else {
          // If not an API limit error, rethrow
          throw error;
        }
      }
    } catch (error) {
      console.error("Error processing cropped image:", error);
      toastSet({
        isOpen: true,
        title: t("errorProcessingImage"),
        text: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to handle re-cropping of existing images
  const handleReCrop = (type, imageUrl, files = null) => {
    // Validate files are images if provided
    if (files && files.length > 0) {
      const invalidFiles = files.filter((file) => !validateImageFile(file));

      if (invalidFiles.length > 0) {
        toastSet({
          isOpen: true,
          title: t("invalidFileType"),
          description: t("onlySpecificImageFormatsAllowed"),
          variant: "destructive",
        });
        return;
      }
    }

    if (imageUrl) {
      // For new image uploads, use the provided image URL
      showCropDialog(type, imageUrl, files);
    } else {
      // For re-cropping existing images, always use the original image if available
      const originalImage =
        type === "profileImage" ? originalProfileImage : originalCoverImage;

      if (originalImage) {
        showCropDialog(type, originalImage);
      } else {
        // Fall back to the cropped image if original is not available
        const croppedImage =
          type === "profileImage" ? profileImage : coverImage;

        if (croppedImage) {
          showCropDialog(type, croppedImage);
          // Let the user know we're using the cropped version
          toastSet({
            isOpen: true,
            title: t("originalImageNotAvailable"),
            description:
              t("usingCroppedImageInstead") || "Using cropped image instead",
            variant: "warning",
          });
        } else {
          toastSet({
            isOpen: true,
            title: t("originalImageNotAvailable"),
            variant: "destructive",
          });
        }
      }
    }
  };

  return (
    <div className="">
      <ProfileImages
        mongoUser={mongoUser}
        visitedMongoUser={adaptedObject}
        isLandingPage={isLandingPage}
        onImageChange={handleImageChange}
        directImageUpdate={true}
        externalToast={toastSet}
        onReCrop={handleReCrop}
        disableUpload={isProcessing}
      />
    </div>
  );
}
// ? code end ProfileImagesUploader
