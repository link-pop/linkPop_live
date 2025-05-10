"use client";

import React from "react";
import { Crop } from "lucide-react";

// ! code start CropImageButton
/**
 * A reusable button component for triggering image cropping
 * @param {Object} props - Component props
 * @param {Object} props.file - The file/image to be cropped
 * @param {Function} props.onCropImage - Function to call when crop is triggered
 * @param {boolean} props.isProcessing - Whether the system is currently processing an image
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element|null} - The crop button or null if not an image
 */
export default function CropImageButton({
  file,
  onCropImage,
  isProcessing = false,
  className = "",
}) {
  // Only show for images, not videos or other file types
  const isImage =
    file.fileType === "image" ||
    (file.fileType && file.fileType.startsWith("image/"));

  if (!isImage || !onCropImage) {
    return null;
  }

  return (
    <div
      onClick={() => !isProcessing && onCropImage(file)}
      className={`bg-white rf cp p-1 shadow-md hover:bg-gray-100 transition-colors ${
        isProcessing ? "pointer-events-none opacity-50" : ""
      } ${className}`}
    >
      <Crop size={16} className="text-gray-600" />
    </div>
  );
}
// ? code end CropImageButton
