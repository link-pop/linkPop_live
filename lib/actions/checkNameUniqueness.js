import { getAll } from "@/lib/actions/crud";
import models from "@/lib/db/models/models";

/**
 * Validates if a name is URL compatible
 * @param {string} name - The name to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function isUrlCompatible(name) {
  if (!name) return false;

  // URL-compatible pattern: only letters, numbers, hyphens, underscores, and dots
  // No spaces, other special characters, etc.
  const urlPattern = /^[a-zA-Z0-9_.-]+$/;
  return urlPattern.test(name);
}

/**
 * Checks if a name is a reserved system collection name
 * @param {string} name - The name to check
 * @returns {Promise<boolean>} True if the name is reserved, false otherwise
 */
export async function isReservedSystemName(name) {
  if (!name) return false;

  const lowercaseName = name.toLowerCase();

  // Get collection names directly from models object
  const modelNames = Object.keys(models);

  // Check if name matches any model/collection names
  const isReservedModelName = modelNames.some(
    (modelName) => modelName.toLowerCase() === lowercaseName
  );

  // Additional reserved words that shouldn't be used as names
  const reservedWords = [
    "test",
    "tests",
    "add",
    "create",
    "update",
    "edit",
    "delete",
    "deleted",
    "url",
    "email",
    "password",
    "tel",
    "color",
    "text",
    "files",
    "tags",
    "createdby",
    "userId",
    "order",
    "active",
    "price",
    "pricing",
    "pricings",
    "cart",
    "carts",
    "image",
    "images",
    "file",
    "api",
    "auth",
    "login",
    "signin",
    "signup",
    "logout",
    "register",
    "admin",
    "admins",
    "settings",
    "support",
    "dashboard",
    "profile",
    "profiles",
    "help",
    "about",
    "contact",
    "contacts",
    "privacy",
    "terms",
    "blog",
    "blogs",
    "post",
    "posts",
    "category",
    "categories",
  ];

  return isReservedModelName || reservedWords.includes(lowercaseName);
}

/**
 * Check if a name is unique across specified collections (case-insensitive)
 * @param {string} name - The name to check for uniqueness
 * @param {string} collectionType - The type of collection ('directlinks', 'landingpages', or 'users')
 * @param {string|null} currentId - Current item ID when updating (optional)
 * @returns {Promise<{isUnique: boolean, error: string|null}>} Result with uniqueness status and error message if any
 */
export async function checkNameUniqueness(
  name,
  collectionType,
  currentId = null
) {
  if (!name) {
    return { isUnique: false, error: "Name is required" };
  }

  // Check URL compatibility
  if (!isUrlCompatible(name)) {
    return {
      isUnique: false,
      error:
        "Name must contain only letters, numbers, hyphens, underscores, and dots (no spaces or other special characters)",
    };
  }

  // Check if name is a reserved system name
  const isReserved = await isReservedSystemName(name);
  if (isReserved) {
    return {
      isUnique: false,
      error: "This name cannot be used",
    };
  }

  // Convert to lowercase for case-insensitive comparison
  const lowercaseName = name.toLowerCase();

  // Determine which collections to check based on collectionType
  let collectionsToCheck = [];

  if (collectionType === "users") {
    // For users, only check against users collection
    collectionsToCheck = ["users"];
  } else {
    // For directlinks and landingpages, check against both collections
    collectionsToCheck = ["directlinks", "landingpages"];
  }

  // Check each collection for name conflicts
  for (const col of collectionsToCheck) {
    const allItems = await getAll({
      col,
      data: {},
    });

    // Filter for case-insensitive name matches
    const nameMatches = allItems.filter(
      (item) => item.name && item.name.toLowerCase() === lowercaseName
    );

    // If updating, exclude the current item from uniqueness check
    let conflictExists = nameMatches.length > 0;

    if (currentId && col === collectionType) {
      const filteredMatches = nameMatches.filter(
        (item) => item._id.toString() !== currentId.toString()
      );

      conflictExists = filteredMatches.length > 0;
    }

    if (conflictExists) {
      return {
        isUnique: false,
        error: `This name is already taken by a ${
          col === "users" ? "user" : col.slice(0, -1)
        }`,
      };
    }
  }

  return { isUnique: true, error: null };
}

// Legacy function for backward compatibility
export async function checkDirectlinkNameUniqueness(name, currentId = null) {
  const result = await checkNameUniqueness(name, "directlinks", currentId);
  return result.isUnique;
}
