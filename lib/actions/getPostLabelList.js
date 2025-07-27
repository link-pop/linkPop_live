"use server";

import { getOne } from "./crud";
import mongoose from "mongoose";

export const getPostLabelList = async (postLabelId) => {
  if (!postLabelId) {
    console.log("❌ No post label ID provided");
    return null;
  }

  try {
    // Use crud.js getOne function to fetch the UserList document
    const postLabelList = await getOne({
      col: "userlists",
      data: {
        _id: new mongoose.Types.ObjectId(postLabelId),
        targetCollection: "postlabels",
        active: true,
      },
    });

    if (
      postLabelList &&
      postLabelList.postLabelIds &&
      postLabelList.postLabelIds.length > 0
    ) {
      console.log(
        "🔍 Found post label list:",
        postLabelId,
        "with",
        postLabelList.postLabelIds.length,
        "posts"
      );
      return postLabelList.postLabelIds;
    } else {
      console.log(
        "❌ No post label list found or no posts in list:",
        postLabelId
      );
      return null;
    }
  } catch (error) {
    console.error("❌ Error fetching post label list:", error);
    return null;
  }
};
