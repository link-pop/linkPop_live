"use server";

import { getAll } from "./crud";
import { connectToDb } from "../db/connectToDb";
import UserList from "../db/models/UserListsModel";
import mongoose from "mongoose";

export async function getUserFullPostLabelLists(userId) {
  try {
    if (!userId) {
      return [];
    }

    await connectToDb();

    // Get user's post label lists
    const lists = await UserList.find({
      createdBy: new mongoose.Types.ObjectId(userId),
      targetCollection: "postlabels",
      active: true,
    })
      .select("_id name description slug color icon postLabelIds")
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    if (!lists.length) {
      return [];
    }

    // Get counts for each list
    const listsWithCounts = await Promise.all(
      lists.map(async (list) => {
        let count = 0;

        if (list.postLabelIds && list.postLabelIds.length > 0) {
          // Get the count of feed posts that are in this post label list
          const feedPosts = await getAll({
            col: "feeds",
            data: {
              _id: { $in: list.postLabelIds },
              createdBy: userId,
              active: true,
            },
          });

          count = Array.isArray(feedPosts) ? feedPosts.length : 0;
        }

        return {
          ...list,
          count,
        };
      })
    );

    return listsWithCounts;
  } catch (error) {
    console.error("❌ Error fetching user post label lists:", error);
    return [];
  }
}
