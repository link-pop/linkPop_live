"use client";

import { generateImageTags } from "@/lib/actions/generateImageTags";

/**
 * Generate AI tags for an image file
 * @param {File} file - The image file to generate tags for
 * @param {string} base64Image - Optional pre-converted base64 image data
 * @returns {Promise<{success: boolean, tags: string[], error?: string}>}
 */
export default async function generateAITagsForImage(file, base64Image = null) {
  try {
    // Only process image files
    if (!file.type || !file.type.startsWith("image/")) {
      return {
        success: false,
        tags: [],
        error: "File is not an image",
      };
    }

    // Convert to base64 if not provided
    let imageBase64 = base64Image;
    if (!imageBase64) {
      imageBase64 = await fileToBase64(file);
    }

    console.log(`Generating AI tags for file: ${file.name || "unknown"}`);
    const tagResult = await generateImageTags(imageBase64);

    if (tagResult.success && tagResult.tags && tagResult.tags.length > 0) {
      console.log(
        `✅ Successfully generated ${tagResult.tags.length} AI tags for ${file.name}:`,
        tagResult.tags
      );
      return {
        success: true,
        tags: tagResult.tags,
      };
    } else {
      console.log(
        `❌ Tag generation failed for ${file.name}:`,
        tagResult.error || "Unknown error"
      );
      console.log("Full tag result:", tagResult);
      return {
        success: false,
        tags: [],
        error: tagResult.error || "Unknown error",
      };
    }
  } catch (error) {
    console.error("Error generating AI tags:", error);
    return {
      success: false,
      tags: [],
      error: error.message || "Unknown error",
    };
  }
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
