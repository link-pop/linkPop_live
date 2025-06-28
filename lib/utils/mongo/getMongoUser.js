"use server";

import { currentUser } from "@clerk/nextjs/server";
import { getOne } from "../../actions/crud";
import { redirect } from "next/navigation";
import { LOGIN_ROUTE } from "../constants";

// Request-level cache to prevent multiple currentUser() calls
let requestCache = new Map();
let currentRequestId = null;
let lastCacheClean = Date.now();

// Generate unique request ID
function generateRequestId() {
  return Date.now() + Math.random().toString(36).substr(2, 9);
}

// Clear cache for new requests and prevent memory leaks
function clearCacheIfNewRequest() {
  const now = Date.now();
  const newRequestId = generateRequestId();

  // Clear cache if new request or if cache is older than 30 seconds
  if (currentRequestId !== newRequestId || now - lastCacheClean > 30000) {
    requestCache.clear();
    currentRequestId = newRequestId;
    lastCacheClean = now;
  }
}

// Cached currentUser function
async function getCachedCurrentUser() {
  clearCacheIfNewRequest();

  if (!requestCache.has("currentUser")) {
    try {
      const user = await currentUser();
      requestCache.set("currentUser", user);
    } catch (error) {
      console.log("❌ Error getting current user:", error);
      requestCache.set("currentUser", null);
    }
  }

  return requestCache.get("currentUser");
}

// List of admin emails for easy management
const ADMIN_EMAILS = [
  process.env.ADMIN_EMAIL,
  process.env.ADMIN_EMAIL2,
  process.env.ADMIN_EMAIL3,
];

// Developer email for additional permissions
const DEV_EMAILS = [
  process.env.DEV_EMAIL,
  process.env.DEV_EMAIL2,
  process.env.DEV_EMAIL3,
];

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
    preferHairColor: user.preferHairColor || "",
    preferBodyType: user.preferBodyType || "",
    preferRaceEthnicity: user.preferRaceEthnicity || "",
    preferAge: user.preferAge || null,
    preferGender: user.preferGender || "",
    preferCreatorName: user.preferCreatorName || "",
    preferCountry: user.preferCountry || "",
    preferCountryCode: user.preferCountryCode || "",
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

  const clerkUser = await getCachedCurrentUser();
  const clerkUserId = clerkUser?.id;

  // Redirect if no auth and redirectIfNoAuth option is true
  if (redirectIfNoAuth && !clerkUserId) {
    redirect(redirectPath);
  }

  // Cache key for MongoDB user queries
  const mongoUserCacheKey = `mongoUser_${clerkUserId || "null"}`;
  const visitedUserCacheKey = `visitedUser_${name || "null"}`;

  // ! get current user by clerkId with caching
  let mongoUser = null;
  if (clerkUserId) {
    if (!requestCache.has(mongoUserCacheKey)) {
      mongoUser = await getOne({
        col: "users",
        data: { clerkId: clerkUserId },
      });
      requestCache.set(mongoUserCacheKey, mongoUser);
    } else {
      mongoUser = requestCache.get(mongoUserCacheKey);
    }
  }

  // ! get visited user by name with caching
  let visitedMongoUser = null;
  if (name) {
    if (!requestCache.has(visitedUserCacheKey)) {
      visitedMongoUser = await getOne({
        col: "users",
        data: { name },
      });
      requestCache.set(visitedUserCacheKey, visitedMongoUser);
    } else {
      visitedMongoUser = requestCache.get(visitedUserCacheKey);
    }
  }

  // Get user for admin/dev check (prefer mongoUser)
  const userForCheck = mongoUser || visitedMongoUser;

  const isAdmin = ADMIN_EMAILS.includes(userForCheck?.email);

  const isDev = DEV_EMAILS.includes(userForCheck?.email);

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
  const { mongoUser, visitedMongoUser, isAdmin, isDev, clerkUser } =
    await getMongoUser(name, options);

  return {
    mongoUser: serializeUser(mongoUser),
    visitedMongoUser: serializeUser(visitedMongoUser),
    isAdmin,
    isDev,
    clerkUser,
  };
}
