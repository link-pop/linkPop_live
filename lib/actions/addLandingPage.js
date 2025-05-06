"use server";

import { add } from "./crud";

export async function addLandingPage(data) {
  try {
    // Ensure we have all required fields
    if (!data.name || !data.username || !data.createdBy) {
      throw new Error("Missing required fields for landing page creation");
    }

    // Make sure we store original images if available
    // If no original images were provided, use the regular images
    const originalProfileImage =
      data.originalProfileImage || data.profileImage || "";
    const originalCoverImage = data.originalCoverImage || data.coverImage || "";

    // Create the landing page
    const result = await add({
      col: "landingpages",
      data: {
        ...data,
        originalProfileImage,
        originalCoverImage,
      },
    });

    return result;
  } catch (error) {
    console.error("Error adding landing page:", error);
    throw new Error(`Failed to add landing page: ${error.message}`);
  }
}
