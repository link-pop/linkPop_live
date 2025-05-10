"use client";

import { useState } from "react";
import { useContext } from "@/components/Context/Context";
import { useTranslation } from "@/components/Context/TranslationContext";
import ImageCropper from "@/components/ui/shared/ImageCropper/ImageCropper";
import getCroppedImg from "@/lib/utils/files/getCroppedImg";

// ! code start useImageCropper
/**
 * Custom hook that provides image cropping functionality
 * @param {Object} props - Hook parameters
 * @param {Array} props.files - Array of files
 * @param {Function} props.filesSet - Function to update files
 * @param {string} props.uploadFolder - Folder to upload to in Cloudinary
 * @returns {Object} - Image cropping utilities and state
 */
export default function useImageCropper({
  files,
  filesSet,
  uploadFolder = "feeds", // Kept for reference, but not used for immediate uploads
}) {
  const { dialogSet, toastSet } = useContext();
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentCropData, setCurrentCropData] = useState(null);

  // Convert Blob to base64 data URL
  const blobToDataURL = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Show image cropper dialog
  const handleCropImage = (preview) => {
    // Only allow cropping for images, not videos
    if (
      preview.fileType !== "image" &&
      !preview.fileType.startsWith("image/")
    ) {
      return;
    }

    // Set current crop data
    setCurrentCropData({
      imageUrl: preview.fileUrl,
      identifier: preview.identifier,
      originalFile: preview.originalFile,
    });

    // Show the dialog with ImageCropper
    dialogSet({
      className: "fixed inset-0 w-screen h-screen z-[100]", // Higher z-index than PageTitle (z50)
      contentClassName:
        "border-none max-w-full max-h-[100dvh] h-screen w-screen m-0 rounded-none overflow-hidden",
      isOpen: true,
      hasCloseIcon: false,
      showBtns: false,
      comp: (
        <ImageCropper
          image={preview.fileUrl}
          onCropComplete={(croppedAreaPixels) =>
            handleCropComplete(
              preview.fileUrl,
              croppedAreaPixels,
              preview.identifier,
              preview.originalFile
            )
          }
          onCancel={handleCancelCrop}
          aspectRatio={1} // Default to square, can be made configurable
          cropShape="rect" // Default to rectangular, can be made configurable
        />
      ),
    });
  };

  // Handle cancellation of crop operation
  const handleCancelCrop = () => {
    // Close the dialog
    dialogSet({ isOpen: false });
    setCurrentCropData(null);
  };

  // Handle crop completion
  const handleCropComplete = async (
    imageUrl,
    croppedAreaPixels,
    identifier,
    originalFile
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

      // Create file from blob
      const croppedFile = new File(
        [croppedImageBlob],
        `cropped_${originalFile?.name || `image_${Date.now()}.jpg`}`,
        {
          type: "image/jpeg",
        }
      );

      // Convert blob to data URL instead of using URL.createObjectURL
      // This ensures the image can be displayed properly in all components
      const dataURL = await blobToDataURL(croppedImageBlob);

      // Store metadata about the original file
      let originalFileData = null;

      // If we have an existing file that's already in Cloudinary
      if (originalFile && originalFile.fileId) {
        originalFileData = {
          fileId: originalFile.fileId,
          fileUrl: originalFile.fileUrl,
        };
      }
      // If original file is a file object (not yet uploaded)
      else if (originalFile) {
        originalFileData = {
          originalFile: originalFile, // Keep reference to actual file
        };
      }
      // If only URL is available (for images that were already on the server)
      else if (imageUrl) {
        const possibleFileId = imageUrl.split("/").pop().split(".")[0];
        originalFileData = {
          imageUrl: imageUrl,
          possibleFileId: possibleFileId,
        };
      }

      // Update files state by replacing the original file with the cropped one
      filesSet((prevFiles) =>
        prevFiles.map((prevFile) => {
          const prevFileId = prevFile.fileUrl ? prevFile._id : prevFile.name;
          if (prevFileId === identifier) {
            // Return the new cropped file with all necessary properties
            return {
              // Base properties for display - use data URL instead of blob URL
              fileUrl: dataURL,
              fileBytes: croppedFile.size,
              fileType: "image/jpeg",
              fileName: croppedFile.name,
              identifier: identifier,

              // Special properties for handling the upload later
              isCropped: true,
              croppedFile: croppedFile, // The actual File object to upload
              originalFileData: originalFileData, // Reference to original
              needsUpload: true, // Flag that this needs uploading when post is saved
            };
          }
          return prevFile;
        })
      );

      // Success toast
      toastSet({
        isOpen: true,
        title: t("imageCropped") || "Image cropped",
        description:
          t("imageWillBeUploadedWithPost") ||
          "Image will be uploaded when the post is saved",
      });
    } catch (error) {
      console.error("Error processing cropped image:", error);
      toastSet({
        isOpen: true,
        title: t("errorProcessingImage") || "Error processing image",
        text: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setCurrentCropData(null);
    }
  };

  // Component that renders the cropper dialog
  const ImageCropperDialog = () => {
    // If there's no current crop data, don't render anything
    if (!currentCropData) return null;

    // This is just a placeholder component that doesn't actually render
    // anything directly - the dialog is shown through the Context system
    return null;
  };

  return {
    isProcessing,
    handleCropImage,
    ImageCropperDialog,
  };
}
// ? code end useImageCropper
