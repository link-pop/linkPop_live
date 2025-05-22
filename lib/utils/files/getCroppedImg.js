import { SITE2 } from "@/config/env";

/**
 * This function creates a cropped image from an image URL and crop data
 * @param {string} imageSrc - URL of the image to crop
 * @param {Object} pixelCrop - Crop coordinates and dimensions in pixels
 * @returns {Promise<Blob>} - A promise that resolves to a cropped image blob
 */
export default async function getCroppedImg(imageSrc, pixelCrop) {
  // Check if this is a GIF on SITE2
  const isGif = imageSrc && imageSrc.toLowerCase().endsWith(".gif");
  const isGifOnSite2 = isGif && SITE2;

  // For GIFs on SITE2, just use the original image without cropping
  if (isGifOnSite2) {
    try {
      // Fetch the GIF and return it as a blob
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error("Error processing GIF:", error);
    }
  }

  // Standard cropping for non-GIF images or non-SITE2
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  // Set canvas size to the cropped size
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Draw the cropped image onto the canvas
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Convert canvas to blob - use original format for GIFs on SITE2
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          return;
        }
        resolve(blob);
      },
      "image/jpeg", // Always use JPEG (GIFs are handled by skipping crop above)
      0.95
    ); // 95% quality JPEG
  });
}

// Helper function to create an image element
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
    image.setAttribute("crossOrigin", "anonymous"); // This enables CORS
  });
