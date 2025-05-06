import {
  MAIN_ROUTE,
  DIRECTLINKS_ROUTE,
  LANDINGPAGES_ROUTE,
} from "../constants";
import { redirect } from "next/navigation";
import getMongoUser from "./getMongoUser";
import { getOne } from "@/lib/actions/crud";

export async function checkCollectionAccess({
  col,
  place = "allPosts",
  postId,
}) {
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
  if (postId && place === "addPost" && !isAdmin) {
    try {
      const post = await getOne({ col: col.name, data: { _id: postId } });

      // If post exists and user is not the owner
      if (post && post.createdBy?.toString() !== mongoUser?._id?.toString()) {
        // Redirect based on collection type
        if (col.name === "directlinks") {
          redirect(DIRECTLINKS_ROUTE);
        } else if (col.name === "landingpages") {
          redirect(LANDINGPAGES_ROUTE);
        } else {
          redirect(MAIN_ROUTE);
        }
      }
    } catch (error) {
      console.error("Error checking post ownership:", error);
      redirect(MAIN_ROUTE);
    }
  }

  return true;
}
