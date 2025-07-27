"use server";

import { getAll } from "./crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import { getLastPostLabelThumbnails } from "@/lib/utils/mongo/getLastPostLabelThumbnails";
import mongoose from "mongoose";

export async function getUserPostLabelLists() {
  try {
    console.log("🔍 getUserPostLabelLists called");
    const { mongoUser } = await getMongoUser();

    if (!mongoUser?._id) {
      console.log("❌ No mongoUser found");
      return [];
    }

    console.log("🔍 mongoUser found:", mongoUser._id);

    const lists = await getAll({
      col: "userlists",
      data: {
        createdBy: new mongoose.Types.ObjectId(mongoUser._id),
        active: true,
        targetCollection: "postlabels", // Only show lists for post labels
      },
    });

    console.log("777 post label lists", lists);

    // Ensure we return a plain array, even if getAll returns an error
    if (!Array.isArray(lists)) {
      return [];
    }

    // Add post label count and lastPostLabelThumbnails to each list
    const listsWithExtendedData = await Promise.all(
      lists.map(async (list) => {
        const postLabelCount = (list.postLabelIds || []).length;

        // Get lastPostLabelThumbnails if not present or if postLabelIds have changed
        let lastPostLabelThumbnails = list.lastPostLabelThumbnails || [];

        // If lastPostLabelThumbnails is empty but we have postLabelIds, fetch them
        if (
          lastPostLabelThumbnails.length === 0 &&
          list.postLabelIds &&
          list.postLabelIds.length > 0
        ) {
          // Extract just the IDs from postLabelIds (they might be populated objects)
          const feedPostIds = list.postLabelIds.map((item) => {
            if (typeof item === "object" && item !== null) {
              return item._id ? item._id.toString() : item.toString();
            }
            return item.toString();
          });
          
          lastPostLabelThumbnails = await getLastPostLabelThumbnails(
            feedPostIds
          );
        }

        // Ensure postLabelIds are properly serialized for client components
        const serializedList = {
          ...list,
          postLabelCount,
          lastPostLabelThumbnails,
        };



        return serializedList;
      })
    );

    return listsWithExtendedData;
  } catch (error) {
    console.error("❌ Error fetching user post label lists:", error);
    return [];
  }
}
