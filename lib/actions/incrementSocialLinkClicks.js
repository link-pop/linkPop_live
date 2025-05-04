"use server";

import { ObjectId } from "mongodb";
import { SITE1, SITE2 } from "@/config/env";
import { connectToDb } from "../db/connectToDb";
import { models } from "../db/models/models";
import { revalidatePath } from "next/cache";
import getMongoUser from "../utils/mongo/getMongoUser";

export async function incrementSocialLinkClicks(linkId) {
  if (!linkId) {
    console.error("No linkId provided to incrementSocialLinkClicks");
    return { success: false, error: "Link ID is required" };
  }

  // Determine the collection name based on site
  const colName = SITE1
    ? "s1sociallinks"
    : SITE2
    ? "s2sociallinks"
    : "sociallinks";

  try {
    await connectToDb();

    // Get the model from our models object
    const Model = models[colName];
    if (!Model) {
      throw new Error(`Model ${colName} not found`);
    }

    // Get the current user
    const { mongoUser } = await getMongoUser();
    if (!mongoUser) {
      console.log("No authenticated user found, tracking click anyway");
    }

    // First fetch the link to check ownership
    const socialLink = await Model.findOne({
      _id: new ObjectId(linkId),
    }).lean();

    if (!socialLink) {
      return { success: false, error: "Social media link not found" };
    }

    // Check if the current user is the owner of the link
    const isOwner =
      mongoUser &&
      socialLink.createdBy &&
      mongoUser._id.toString() === socialLink.createdBy.toString();

    // If the user is the owner, don't track the click
    if (isOwner) {
      console.log("Link owner's click not tracked");
      return { success: true, linkId, ownerClick: true };
    }

    // Use $inc operator to increment the clickCount field directly
    // We bypass the ownership check here since clicks can come from any user
    const updatedDocument = await Model.findOneAndUpdate(
      { _id: new ObjectId(linkId) },
      { $inc: { clickCount: 1 } },
      { new: true }
    ).lean();

    if (!updatedDocument) {
      return { success: false, error: "Failed to update click count" };
    }

    // Always revalidate the root path to ensure updated counts are shown
    revalidatePath("/");

    return { success: true, linkId };
  } catch (error) {
    console.error("Failed to increment social media link clicks:", error);
    return { success: false, error: error.message };
  }
}
