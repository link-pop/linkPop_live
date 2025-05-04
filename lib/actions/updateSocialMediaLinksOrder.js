"use server";

import { ObjectId } from "mongodb";
import { update, getAll } from "./crud";
import getMongoUser from "../utils/mongo/getMongoUser";
import { SOCIAL_MEDIA_ROUTE } from "../utils/constants";
import { SITE1, SITE2 } from "@/config/env";

export async function updateSocialMediaLinksOrder(formData) {
  const { mongoUser } = await getMongoUser();
  const linksJson = formData.get("links");
  const landingPageId = formData.get("landingPageId");

  // Determine the collection name based on site
  const colName = SITE1
    ? "s1sociallinks"
    : SITE2
    ? "s2sociallinks"
    : "sociallinks";

  if (!linksJson) {
    return { success: false, error: "Links data is required" };
  }

  try {
    // Parse the links JSON
    const links = JSON.parse(linksJson);

    // TODO !!!!!!! improve performance
    // Update each link with its new order
    for (let i = 0; i < links.length; i++) {
      await update({
        col: colName,
        data: { _id: new ObjectId(links[i]._id) },
        update: { order: i },
        revalidate: SOCIAL_MEDIA_ROUTE,
      });
    }

    // Create query for getting updated links
    const query = { createdBy: new ObjectId(mongoUser._id) };

    // Add landingPageId to query if it exists and is valid
    if (
      landingPageId &&
      landingPageId !== "undefined" &&
      landingPageId !== "null"
    ) {
      try {
        query.landingPageId = new ObjectId(landingPageId);
      } catch (error) {
        console.warn("Invalid landingPageId format:", landingPageId);
      }
    }

    // Get updated links
    const updatedLinks = await getAll({
      col: colName,
      data: query,
      sort: { order: 1 },
    });

    return { success: true, links: updatedLinks };
  } catch (error) {
    console.error("Failed to update social media links order:", error);
    return { success: false, error: error.message };
  }
}
