"use client";

// ! code start ProfileImagesUploader
import { useState, useEffect } from "react";
import ProfileImages from "@/app/my/settings/profile/ProfileImages";
import { useContext } from "@/components/Context/Context";
import ImageCropper from "@/components/ui/shared/ImageCropper/ImageCropper";
import getCroppedImg from "@/lib/utils/files/getCroppedImg";
import uploadFilesToCloudinary from "@/components/Cloudinary/uploadFilesToCloudinary";
import { useTranslation } from "@/components/Context/TranslationContext";

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
}) {
  const { toastSet, dialogSet } = useContext();
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);

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

  // Create an adapted user object to simulate a visited user
  const adaptedUser = {
    profileImage: profileImage,
    coverImage: coverImage,
    name: mongoUser?.name || "",
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
    const aspectRatio = type === "profileImage" ? 1 : 16 / 9; // Square for profile, 16:9 for cover
    const cropShape = type === "profileImage" ? "round" : "rect";

    dialogSet({
      className: "fixed inset-0 w-screen h-screen",
      contentClassName:
        "border-none max-w-full max-h-[100dvh] h-screen w-screen m-0 rounded-none",
      isOpen: true,
      hasCloseIcon: false,
      title: t("cropImage"),
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

      let uploadOptions = { isCroppedImage: true };

      // If we have an original file that needs to be uploaded first, do that
      if (files && files.length > 0) {
        // First upload the original file
        const originalFiles = await uploadFilesToCloudinary(
          files,
          "users" // Use "users" folder instead of "landingpages"
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
      } else {
        // Extract the public_id from the existing image URL if no new original file
        const originalFileId = imageUrl.split("/").pop().split(".")[0];
        uploadOptions.originalFileId = originalFileId;
      }

      // Upload the cropped image
      const uploadedFiles = await uploadFilesToCloudinary(
        [file],
        "users", // Use "users" folder instead of "landingpages"
        null,
        uploadOptions
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
        visitedMongoUser={adaptedUser}
        isLandingPage={false}
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
