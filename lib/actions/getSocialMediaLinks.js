"use server";

import { ObjectId } from "mongodb";
import { getAll } from "./crud";
import { SITE1, SITE2 } from "@/config/env";

export async function getSocialMediaLinks(
  userId,
  landingPageId = null,
  refreshTrigger = null
) {
  // refreshTrigger is not used in the function but helps with cache busting in the client
  try {
    // Determine the collection name based on site
    const colName = SITE1
      ? "s1sociallinks"
      : SITE2
      ? "s2sociallinks"
      : "sociallinks";

    // Create the query object
    let query = {};

    if (SITE1) {
      // On SITE1, filter by createdBy only
      query = { createdBy: new ObjectId(userId) };
      console.log("Getting social links for SITE1 - createdBy only:", userId);
    } else if (SITE2) {
      // On SITE2, filter by landingPageId (if available)
      if (landingPageId) {
        try {
          query = { landingPageId: new ObjectId(landingPageId) };
          console.log(
            "Getting social links for SITE2 - landingPageId only:",
            landingPageId
          );
        } catch (error) {
          console.warn(
            "Invalid landingPageId format, using createdBy instead:",
            landingPageId
          );
          query = { createdBy: new ObjectId(userId) };
        }
      } else {
        console.log(
          "Warning: On SITE2 but no landingPageId provided, using createdBy as fallback"
        );
        query = { createdBy: new ObjectId(userId) };
      }
    } else {
      // Default behavior (neither SITE1 nor SITE2 is true)
      query = { createdBy: new ObjectId(userId) };

      // Add landingPageId to query if provided and valid
      if (landingPageId) {
        try {
          query.landingPageId = new ObjectId(landingPageId);
          console.log(
            "Getting social links with both createdBy and landingPageId"
          );
        } catch (error) {
          console.warn("Invalid landingPageId format:", landingPageId);
        }
      } else {
        console.log("Getting social links with createdBy only (default)");
      }
    }

    const links = await getAll({
      col: colName,
      data: query,
      sort: { order: 1 },
    });

    return links;
  } catch (error) {
    console.error("Error fetching social media links:", error);
    return [];
  }
}
