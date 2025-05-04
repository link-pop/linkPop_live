"use server";

import { ObjectId } from "mongodb";
import { removeOne, getAll, update } from "./crud";
import getMongoUser from "../utils/mongo/getMongoUser";
import { SOCIAL_MEDIA_ROUTE } from "../utils/constants";
import { SITE1, SITE2 } from "@/config/env";

export async function removeSocialMediaLink(formData) {
  const { mongoUser } = await getMongoUser();
  const linkId = formData.get("linkId");
  const landingPageId = formData.get("landingPageId");

  // Determine the collection name based on site
  const colName = SITE1
    ? "s1sociallinks"
    : SITE2
    ? "s2sociallinks"
    : "sociallinks";

  if (!linkId) {
    return { success: false, error: "Link ID is required" };
  }

  try {
    // Create the delete query
    const deleteQuery = {
      _id: new ObjectId(linkId),
      createdBy: new ObjectId(mongoUser._id),
    };

    // Delete the link
    await removeOne({
      col: colName,
      data: deleteQuery,
      revalidate: SOCIAL_MEDIA_ROUTE,
    });

    // Create the query for getting remaining links
    const remainingLinksQuery = { createdBy: new ObjectId(mongoUser._id) };

    // Add landingPageId to query if it exists and is valid
    if (
      landingPageId &&
      landingPageId !== "undefined" &&
      landingPageId !== "null"
    ) {
      try {
        // Verify it's a valid ObjectId
        remainingLinksQuery.landingPageId = new ObjectId(landingPageId);
      } catch (error) {
        console.warn("Invalid landingPageId format:", landingPageId);
        // Don't add invalid landingPageId to query
      }
    }

    // Get remaining links
    const remainingLinks = await getAll({
      col: colName,
      data: remainingLinksQuery,
      sort: { order: 1 },
    });

    // Reorder the remaining links
    for (let i = 0; i < remainingLinks.length; i++) {
      await update({
        col: colName,
        data: { _id: new ObjectId(remainingLinks[i]._id) },
        update: { order: i },
        revalidate: SOCIAL_MEDIA_ROUTE,
      });
    }

    // Get updated links with the same query as before
    const updatedLinks = await getAll({
      col: colName,
      data: remainingLinksQuery,
      sort: { order: 1 },
    });

    return { success: true, links: updatedLinks };
  } catch (error) {
    console.error("Failed to remove social media link:", error);
    return { success: false, error: error.message };
  }
}
