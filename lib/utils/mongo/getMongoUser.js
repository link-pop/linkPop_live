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

/**
 * Serializes a MongoDB user object for client components
 * @param {Object} user - Raw MongoDB user object
 * @returns {Object} - Serialized user object
 */
function serializeUser(user) {
  if (!user) return null;

  return {
    _id: user._id?.toString() || user._id,
    name: user.name || "",
    email: user.email || "",
    profileType: user.profileType || "",
    profileImage: user.profileImage || "",
    coverImage: user.coverImage || "",
    clerkId: user.clerkId || "",
    plan: user.plan || "",
    isAvailable: Boolean(user.isAvailable),
    subscriptionPrice: user.subscriptionPrice || 0,
    age: user.age || null,
    hairColor: user.hairColor || "",
    bodyType: user.bodyType || "",
    raceEthnicity: user.raceEthnicity || "",
    preferAge: user.preferAge || null,
    lastVisitedCreatorsTags: user.lastVisitedCreatorsTags || null,
    lastUploadedCreatorTags: user.lastUploadedCreatorTags || null,
    hiddenSuggestions: user.hiddenSuggestions || [],
    displayAllUsersIfNoMatchFoundForSuggestions: Boolean(
      user.displayAllUsersIfNoMatchFoundForSuggestions
    ),
    isAdmin: Boolean(user.isAdmin),
    isDev: Boolean(user.isDev),
    isOwner: Boolean(user.isOwner),
    referralCode: user.referralCode || "",
    referredBy: user.referredBy?.toString() || user.referredBy || null,
    referralStats: user.referralStats || null,
    createdAt:
      user.createdAt instanceof Date
        ? user.createdAt.toISOString()
        : user.createdAt,
    updatedAt:
      user.updatedAt instanceof Date
        ? user.updatedAt.toISOString()
        : user.updatedAt,
  };
}

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

/**
 * Get serialized MongoDB user data for client components
 * This function returns properly serialized data that can be passed to client components
 * @param {string} name - Optional user name to fetch
 * @param {Object} options - Options object
 * @returns {Object} - Serialized user data
 */
export async function getSerializedMongoUser(name, options = {}) {
  const { mongoUser, visitedMongoUser, isAdmin, isDev } = await getMongoUser(
    name,
    options
  );

  return {
    mongoUser: serializeUser(mongoUser),
    visitedMongoUser: serializeUser(visitedMongoUser),
    isAdmin,
    isDev,
  };
}
