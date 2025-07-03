"use server";

import { add } from "./crud";
import {
  generateProtectionKey,
  shouldProtectPlatform,
} from "../utils/linkProtection";

/**
 * Creates a social link with automatic protection if needed
 * @param {Object} linkData - The social link data
 * @param {string} collection - The collection name to use
 * @returns {Object} The created social link
 */
export async function createProtectedSocialLink(
  linkData,
  collection = "sociallinks"
) {
  try {
    // Check if this platform should be protected
    const needsProtection = shouldProtectPlatform(linkData.platform);

    // Prepare the data with protection fields if needed
    const protectedData = {
      ...linkData,
      isProtected: needsProtection,
      protectionKey: needsProtection ? "temp_key" : "", // Temporary key, will be updated after creation
    };

    // Create the social link
    const createdLink = await add({
      col: collection,
      data: protectedData,
    });

    if (!createdLink || createdLink.error) {
      throw new Error(createdLink?.error || "Failed to create social link");
    }

    // If protection is needed, generate a proper protection key and update the link
    if (needsProtection) {
      const protectionKey = generateProtectionKey(
        createdLink._id,
        linkData.platform
      );

      // Update the link with the real protection key
      const { update } = await import("./crud");
      const updatedLink = await update({
        col: collection,
        data: { _id: createdLink._id },
        update: { protectionKey },
        skipOwnershipCheck: true,
      });

      if (updatedLink && !updatedLink.error) {
        return updatedLink;
      }
    }

    return createdLink;
  } catch (error) {
    console.error("❌ Error creating protected social link:", error);
    return { error: error.message || "Failed to create protected social link" };
  }
}

/**
 * Updates an existing social link with protection if needed
 * @param {string} linkId - The ID of the social link to update
 * @param {Object} updateData - The update data
 * @param {string} collection - The collection name to use
 * @returns {Object} The updated social link
 */
export async function updateProtectedSocialLink(
  linkId,
  updateData,
  collection = "sociallinks"
) {
  try {
    const { getOne, update } = await import("./crud");

    // Get the existing link
    const existingLink = await getOne({
      col: collection,
      data: { _id: linkId },
    });

    if (!existingLink) {
      throw new Error("Social link not found");
    }

    // Check if protection status should change
    const needsProtection = shouldProtectPlatform(
      updateData.platform || existingLink.platform
    );
    const currentlyProtected = existingLink.isProtected;

    let finalUpdateData = { ...updateData };

    // If protection status is changing
    if (needsProtection !== currentlyProtected) {
      if (needsProtection) {
        // Need to add protection
        const protectionKey = generateProtectionKey(
          linkId,
          updateData.platform || existingLink.platform
        );
        finalUpdateData = {
          ...finalUpdateData,
          isProtected: true,
          protectionKey,
        };
      } else {
        // Need to remove protection
        finalUpdateData = {
          ...finalUpdateData,
          isProtected: false,
          protectionKey: "",
        };
      }
    }

    // Update the link
    const updatedLink = await update({
      col: collection,
      data: { _id: linkId },
      update: finalUpdateData,
    });

    return updatedLink;
  } catch (error) {
    console.error("❌ Error updating protected social link:", error);
    return { error: error.message || "Failed to update protected social link" };
  }
}
