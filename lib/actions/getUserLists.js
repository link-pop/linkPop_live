"use server";

import { getAll } from "./crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import { getLastAttachmentUrls } from "@/lib/utils/mongo/getLastAttachmentUrls";

export async function getUserLists() {
  try {
    const { mongoUser } = await getMongoUser();

    if (!mongoUser?._id) {
      return [];
    }

    const lists = await getAll({
      col: "userlists",
      data: {
        createdBy: mongoUser._id,
        active: true,
        targetCollection: "attachments", // Only show lists for attachments
      },
    });

    // Ensure we return a plain array, even if getAll returns an error
    if (!Array.isArray(lists)) {
      return [];
    }

    // Add attachment count and lastAttachmentUrls to each list
    const listsWithExtendedData = await Promise.all(
      lists.map(async (list) => {
        const attachmentCount = (list.attachmentIds || []).length;

        // Get lastAttachmentUrls if not present or if attachmentIds have changed
        let lastAttachmentUrls = list.lastAttachmentUrls || [];

        // If lastAttachmentUrls is empty but we have attachmentIds, fetch them
        if (
          lastAttachmentUrls.length === 0 &&
          list.attachmentIds &&
          list.attachmentIds.length > 0
        ) {
          lastAttachmentUrls = await getLastAttachmentUrls(list.attachmentIds);

          // Optionally update the list in the database (background operation)
          if (lastAttachmentUrls.length > 0) {
            // Don't await this to avoid slowing down the response
            Promise.resolve()
              .then(async () => {
                const { update } = await import("./crud");
                await update({
                  col: "userlists",
                  data: { _id: list._id },
                  update: { lastAttachmentUrls },
                  skipOwnershipCheck: true,
                });
              })
              .catch((error) => {
                console.error(
                  "❌ Error updating lastAttachmentUrls in background:",
                  error
                );
              });
          }
        }

        return {
          ...list,
          attachmentCount,
          lastAttachmentUrls,
        };
      })
    );

    return listsWithExtendedData;
  } catch (error) {
    console.error("❌ Error fetching user lists:", error);
    return [];
  }
}
