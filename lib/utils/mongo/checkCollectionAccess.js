import { MAIN_ROUTE } from "../constants";
import { redirect } from "next/navigation";
import getMongoUser from "./getMongoUser";

export async function checkCollectionAccess({ col, place = "allPosts" }) {
  // ! "settings" page has no collection access control
  if (!col) return;

  if (!col) {
    redirect(MAIN_ROUTE);
    throw new Error("Collection not found");
  }

  const { isAdmin } = await getMongoUser();

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

  return true;
}
