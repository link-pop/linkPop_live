"use server";

import { currentUser } from "@clerk/nextjs/server";
import { getOne } from "../../actions/crud";
import { redirect } from "next/navigation";
import { LOGIN_ROUTE } from "../constants";

// List of admin emails for easy management
const ADMIN_EMAILS = [
  process.env.ADMIN_EMAIL,
  process.env.ADMIN_EMAIL2,
  process.env.ADMIN_EMAIL3,
];

// Developer email for additional permissions
const DEV_EMAIL = process.env.DEV_EMAIL || "enenotowitch@gmail.com";

export default async function getMongoUser(name, options = {}) {
  const { redirectIfNoAuth = false, redirectPath = LOGIN_ROUTE } = options;

  const clerkUser = await currentUser();
  const clerkUserId = clerkUser?.id;

  // Redirect if no auth and redirectIfNoAuth option is true
  if (redirectIfNoAuth && !clerkUserId) {
    redirect(redirectPath);
  }

  // ! get current user by clerkId
  let mongoUser = clerkUserId
    ? await getOne({
        col: "users",
        data: { clerkId: clerkUserId },
      })
    : null;

  // ! get visited user by name if name was passed
  let visitedMongoUser = name
    ? await getOne({
        col: "users",
        data: { name },
      })
    : null;

  // Get user for admin/dev check (prefer mongoUser)
  const userForCheck = mongoUser || visitedMongoUser;

  const isAdmin = ADMIN_EMAILS.includes(userForCheck?.email);

  const isDev = userForCheck?.email === DEV_EMAIL;

  // Add admin/dev status to both users if they exist
  if (mongoUser) {
    mongoUser = {
      ...mongoUser,
      isAdmin,
      isDev,
      // TODO !!! ???
      // If no visitedMongoUser, we're on our own profile
      isOwner:
        !visitedMongoUser ||
        mongoUser?._id?.toString() === visitedMongoUser?._id?.toString(),
    };
  }

  if (visitedMongoUser) {
    visitedMongoUser = {
      ...visitedMongoUser,
      isAdmin,
      isDev,
      isOwner: mongoUser?._id?.toString() === visitedMongoUser?._id?.toString(),
    };
  }

  return { mongoUser, visitedMongoUser, isAdmin, isDev, clerkUser };
}
