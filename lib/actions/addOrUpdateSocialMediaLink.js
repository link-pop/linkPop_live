"use server";

import { ObjectId } from "mongodb";
import { add, update, getAll } from "./crud";
import getMongoUser from "../utils/mongo/getMongoUser";
import { SOCIAL_MEDIA_ROUTE } from "../utils/constants";
import { SITE1, SITE2 } from "@/config/env";

export async function addOrUpdateSocialMediaLink(formData) {
  const { mongoUser } = await getMongoUser();
  if (!mongoUser) {
    return { success: false, error: "User not found, please reload the page" };
  }
  const platform = formData.get("platform");
  const username = formData.get("username");
  const websiteUrl = formData.get("websiteUrl");
  const label = formData.get("label");
  const linkId = formData.get("linkId");
  const landingPageId = formData.get("landingPageId");

  // Determine the collection name based on site
  const colName = SITE1
    ? "s1sociallinks"
    : SITE2
    ? "s2sociallinks"
    : "sociallinks";

  if (!platform || !label) {
    return { success: false, error: "Missing required fields" };
  }

  try {
    console.log("Adding/updating social media link:", {
      platform,
      username,
      websiteUrl,
      label,
      linkId,
      landingPageId,
      collection: colName,
    });

    // Get current social media links for ordering purposes
    const query = { createdBy: new ObjectId(mongoUser._id) };

    // Add landingPageId to query if it exists and is valid
    if (
      landingPageId &&
      landingPageId !== "undefined" &&
      landingPageId !== "null"
    ) {
      try {
        // Verify it's a valid ObjectId
        query.landingPageId = new ObjectId(landingPageId);
      } catch (error) {
        console.warn("Invalid landingPageId format:", landingPageId);
        // Don't add invalid landingPageId to query
      }
    }

    const existingLinks = await getAll({
      col: colName,
      data: query,
      sort: { order: 1 },
    });

    console.log("Existing links count:", existingLinks?.length);

    let result;

    if (linkId) {
      console.log("Updating existing link with ID:", linkId);
      // Update existing link
      const updateData = {
        platform,
        username,
        websiteUrl,
        label,
      };

      // Add landingPageId to update data if it exists and is valid
      if (
        landingPageId &&
        landingPageId !== "undefined" &&
        landingPageId !== "null"
      ) {
        try {
          // Verify it's a valid ObjectId
          updateData.landingPageId = new ObjectId(landingPageId);
        } catch (error) {
          console.warn(
            "Invalid landingPageId format for update:",
            landingPageId
          );
          // Don't add invalid landingPageId to update data
        }
      }

      result = await update({
        col: colName,
        data: { _id: new ObjectId(linkId) },
        update: updateData,
        revalidate: SOCIAL_MEDIA_ROUTE,
      });

      console.log("Update result:", result);
    } else {
      console.log("Adding new link");
      // Add new link with appropriate order
      const order = existingLinks?.length || 0; // New links go to the end

      const newLinkData = {
        createdBy: new ObjectId(mongoUser._id),
        platform,
        username,
        websiteUrl,
        label,
        order,
      };

      // Add landingPageId to new link data if it exists and is valid
      if (
        landingPageId &&
        landingPageId !== "undefined" &&
        landingPageId !== "null"
      ) {
        try {
          // Verify it's a valid ObjectId
          newLinkData.landingPageId = new ObjectId(landingPageId);
        } catch (error) {
          console.warn(
            "Invalid landingPageId format for new link:",
            landingPageId
          );
          // Don't add invalid landingPageId to new link data
        }
      }

      result = await add({
        col: colName,
        data: newLinkData,
        revalidate: SOCIAL_MEDIA_ROUTE,
      });

      console.log("Add result:", result);
    }

    // Get updated links with the same query as before
    const updatedLinks = await getAll({
      col: colName,
      data: query,
      sort: { order: 1 },
    });

    console.log("Updated links count:", updatedLinks?.length);

    return { success: true, links: updatedLinks };
  } catch (error) {
    console.error("Failed to add/update social media link:", error);
    return { success: false, error: error.message };
  }
}
