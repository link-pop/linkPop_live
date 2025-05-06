"use server";

import { update } from "./crud";

export async function updateLandingPage(id, data) {
  try {
    // Ensure ID is provided
    if (!id) {
      throw new Error("Landing page ID is required for update");
    }

    // Make sure we store original images if available
    // If originalImage fields weren't provided but new images were, update the original image fields
    const updates = { ...data };

    // If we have a new profile image but no original set, use the new image as original
    if (data.profileImage && !data.originalProfileImage) {
      updates.originalProfileImage = data.profileImage;
    }

    // If we have a new cover image but no original set, use the new image as original
    if (data.coverImage && !data.originalCoverImage) {
      updates.originalCoverImage = data.coverImage;
    }

    // Update the landing page
    const result = await update({
      col: "landingpages",
      data: { _id: id },
      update: updates,
      revalidate: "/landingpages",
    });

    return result;
  } catch (error) {
    console.error("Error updating landing page:", error);
    throw new Error(`Failed to update landing page: ${error.message}`);
  }
}
