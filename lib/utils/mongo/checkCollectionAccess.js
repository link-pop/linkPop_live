import {
  MAIN_ROUTE,
  DIRECTLINKS_ROUTE,
  LANDINGPAGES_ROUTE,
} from "../constants";
import { redirect } from "next/navigation";
import getMongoUser from "./getMongoUser";
import { getOne } from "@/lib/actions/crud";
import { currentUser } from "@clerk/nextjs/server";

export async function checkCollectionAccess({
  col,
  place = "allPosts",
  postId,
}) {
  // First, wait for Clerk user to be loaded
  const clerkUser = await currentUser();
  console.log("col", col);
  console.log("place", place);
  console.log("postId", postId);
  console.log("currentUser", clerkUser);

  // Only allow authenticated users
  if (!clerkUser?.id) {
    console.log("123 NO AUTH USER - REDIRECTING");
    redirect(MAIN_ROUTE);
    throw new Error("User not authenticated");
  }

  // ! "settings" page has no collection access control
  if (!col) return;

  if (!col) {
    redirect(MAIN_ROUTE);
    throw new Error("Collection not found");
  }

  const { mongoUser, isAdmin } = await getMongoUser();

  // ! allow only admins
  if (col.settings?.for?.[place] === "admin" && !isAdmin) {
    redirect(MAIN_ROUTE);
    throw new Error("Admin access required");
  }

  // ! disable access for users collection
  if (place === "allPosts" && col.name === "users") {
    redirect(MAIN_ROUTE);
    throw new Error("Admin access required");
  }

  // ! check ownership for update operations when postId is provided
  if (postId && place === "addPost" && !isAdmin && clerkUser) {
    console.log("123 clerkUser", clerkUser);
    console.log("123 mongoUser", mongoUser);
    console.log("123 isAdmin", isAdmin);
    console.log("123 postId", postId);
    console.log("123 place", place);
    console.log("123 col", col);
    try {
      const post = await getOne({ col: col.name, data: { _id: postId } });
      console.log("123 post found:", post);
      console.log("123 post.createdBy:", post?.createdBy);
      console.log("123 mongoUser._id:", mongoUser?._id);

      // If post exists and user is not the owner
      if (post && mongoUser?._id) {
        // Handle case where createdBy is a full object (populated) or just an ID
        let postCreatorId;
        if (
          post.createdBy &&
          typeof post.createdBy === "object" &&
          post.createdBy._id
        ) {
          postCreatorId = post.createdBy._id.toString();
        } else if (post.createdBy) {
          postCreatorId = post.createdBy.toString();
        }

        const mongoUserId = mongoUser._id.toString();

        console.log("123 postCreatorId:", postCreatorId);
        console.log("123 mongoUserId:", mongoUserId);

        // If user is NOT the owner of the post
        if (postCreatorId && postCreatorId !== mongoUserId) {
          console.log("123 NOT OWNER - REDIRECTING");
          // Redirect based on collection type
          if (col.name === "directlinks") {
            redirect(DIRECTLINKS_ROUTE);
          } else if (col.name === "landingpages") {
            redirect(LANDINGPAGES_ROUTE);
          } else {
            redirect(MAIN_ROUTE);
          }
        } else {
          console.log("123 IS OWNER - ALLOWING ACCESS");
        }
      } else {
        console.log("123 No post found or missing mongoUser._id");
        // If post doesn't exist or has no createdBy field
        redirect(MAIN_ROUTE);
      }
    } catch (error) {
      console.error("Error checking post ownership:", error);
      redirect(MAIN_ROUTE);
    }
  }

  return true;
}
