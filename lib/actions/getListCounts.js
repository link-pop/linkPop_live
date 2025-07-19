"use server";

import { getAll } from "./crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";

export async function getListCounts(systemLists, userLists = []) {
  try {
    const { mongoUser } = await getMongoUser();

    if (!mongoUser?._id) {
      return {};
    }

    // Get counts for each system list type
    const systemListCounts = await Promise.all(
      Object.values(systemLists).map(async (list) => {
        let query = { createdBy: mongoUser._id };

        // Apply filters based on list configuration
        if (list.uploadedFrom) {
          query.uploadedFrom = list.uploadedFrom;
        }

        if (list.fileType) {
          query.fileType = list.fileType;
        }

        if (list.excludeGifs) {
          const results = await getAll({
            col: "attachments",
            data: query,
            searchParams: { fileUrl_not_contains: ".gif" },
          });
          return Array.isArray(results) ? results.length : 0;
        }

        if (list.onlyGifs) {
          const results = await getAll({
            col: "attachments",
            data: query,
            searchParams: { fileUrl_contains: ".gif" },
          });
          return Array.isArray(results) ? results.length : 0;
        }

        const results = await getAll({
          col: "attachments",
          data: query,
        });
        return Array.isArray(results) ? results.length : 0;
      })
    );

    // Create counts object for system lists
    const systemCounts = Object.keys(systemLists).reduce((acc, key, index) => {
      acc[key] = systemListCounts[index] || 0;
      return acc;
    }, {});

    // Get counts for custom lists
    const customListCounts = await Promise.all(
      (userLists || []).map(async (list) => {
        // For custom lists, count the attachmentIds directly
        if (list.attachmentIds && Array.isArray(list.attachmentIds)) {
          return list.attachmentIds.length;
        }

        // Fallback to 0 if no attachmentIds
        return 0;
      })
    );

    // Add custom list counts
    (userLists || []).forEach((list, index) => {
      systemCounts[list.slug] = customListCounts[index] || 0;
    });

    return systemCounts;
  } catch (error) {
    console.error("❌ Error fetching list counts:", error);
    return {};
  }
}
