"use server";

import getMongoUser from "../utils/mongo/getMongoUser";
import LandingPageModel from "../db/models/LandingPageModel";
import DirectlinkModel from "../db/models/DirectlinkModel";
import UserModel from "../db/models/UserModel";
import SocialLinkModel from "../db/models/SocialLinkModel";
import ReferralEarningModel from "../db/models/ReferralEarningModel";
import ReferralModel from "../db/models/ReferralModel";
import Subscriptions2Model from "../db/models/Subscriptions2Model";
import GeoFilterModel from "../db/models/GeoFilterModel";

/**
 * Next.js action: Checks if the current user is the owner of a document.
 * @param {Object} document - The document to check ownership for
 * @returns {Promise<{isOwner: boolean, error: string|null, mongoUser: Object|null}>}
 */
export async function checkUserOwnership(document) {
  // Add extensive logging for debugging
  console.log(
    "checkUserOwnership called with document:",
    JSON.stringify(
      {
        _id: document?._id?.toString(),
        type: document?.constructor?.name || "Unknown",
        fields: Object.keys(document || {}),
        createdBy: document?.createdBy?.toString(),
        userId: document?.userId?.toString(),
      },
      null,
      2
    )
  );

  // // test return true
  // return {
  //   isOwner: true,
  //   error: null,
  //   mongoUser: null,
  // };

  if (!document) {
    console.log("Document is null or undefined");
    return {
      isOwner: false,
      error: "Invalid document",
      mongoUser: null,
    };
  }

  // Skip ownership check for GeoFilterModel
  // Check if it looks like a GeoFilterModel by checking its properties
  if (
    document.entityType &&
    document.entityId &&
    document.mode &&
    Array.isArray(document.locations) &&
    typeof document.active === "boolean" &&
    ["allow", "block"].includes(document.mode) &&
    ["landingpage", "directlink", "user"].includes(document.entityType)
  ) {
    console.log("Detected GeoFilterModel document, skipping ownership check");
    const { mongoUser } = await getMongoUser();
    return {
      isOwner: true,
      error: null,
      mongoUser,
    };
  }

  const ownerField = document.createdBy
    ? "createdBy"
    : document.userId
    ? "userId"
    : null;

  console.log("Owner field identified:", ownerField);

  const checkOwnershipByField = (doc, mongoUser) => {
    const field = doc.createdBy ? "createdBy" : doc.userId ? "userId" : null;
    if (!field) return false;
    const result = doc[field]?.toString() === mongoUser._id.toString();
    console.log("Ownership check result:", {
      field,
      docOwner: doc[field]?.toString(),
      userId: mongoUser._id.toString(),
      match: result,
    });
    return result;
  };

  try {
    const { mongoUser } = await getMongoUser();
    console.log(
      "Current user:",
      mongoUser ? mongoUser._id.toString() : "No user found"
    );

    if (!mongoUser || !mongoUser._id) {
      return { isOwner: false, error: "Not authenticated", mongoUser: null };
    }

    // Direct ownership field
    if (ownerField) {
      const isOwner =
        document[ownerField]?.toString() === mongoUser._id.toString();
      console.log("Direct ownership check:", {
        field: ownerField,
        docOwner: document[ownerField]?.toString(),
        userId: mongoUser._id.toString(),
        match: isOwner,
      });

      return {
        isOwner,
        error: isOwner
          ? null
          : "You do not have permission to modify this document",
        mongoUser,
      };
    }

    // GeoFilterModel: check parent entity
    if (document.entityType && document.entityId) {
      let parentDoc = null;
      let parentType = null;
      if (document.entityType === "landingpage") {
        parentDoc = await LandingPageModel.findById(document.entityId);
        parentType = "LandingPage";
      } else if (document.entityType === "directlink") {
        parentDoc = await DirectlinkModel.findById(document.entityId);
        parentType = "Directlink";
      } else if (document.entityType === "user") {
        parentDoc = await UserModel.findById(document.entityId);
        parentType = "User";
      }
      if (!parentDoc) {
        return {
          isOwner: false,
          error: `Parent entity (${document.entityType}) not found`,
          mongoUser,
        };
      }
      const isOwner = checkOwnershipByField(parentDoc, mongoUser);
      return {
        isOwner,
        error: isOwner
          ? null
          : `You do not have permission to modify this ${parentType}`,
        mongoUser,
      };
    }

    // SocialLinkModel: check createdBy or landingPageId's owner
    if (
      document.landingPageId &&
      document._id &&
      document.platform &&
      document.label
    ) {
      if (
        document.createdBy &&
        document.createdBy.toString() === mongoUser._id.toString()
      ) {
        return { isOwner: true, error: null, mongoUser };
      }
      if (document.landingPageId) {
        const parentLandingPage = await LandingPageModel.findById(
          document.landingPageId
        );
        if (
          parentLandingPage &&
          checkOwnershipByField(parentLandingPage, mongoUser)
        ) {
          return { isOwner: true, error: null, mongoUser };
        }
      }
      return {
        isOwner: false,
        error: "You do not have permission to modify this SocialLink",
        mongoUser,
      };
    }

    // ReferralEarningModel: check referrerId or referredId
    if (
      typeof document.referrerId !== "undefined" &&
      typeof document.referredId !== "undefined" &&
      typeof document.commissionAmount !== "undefined"
    ) {
      const isOwner =
        document.referrerId?.toString() === mongoUser._id.toString() ||
        document.referredId?.toString() === mongoUser._id.toString();
      return {
        isOwner,
        error: isOwner
          ? null
          : "You do not have permission to modify this ReferralEarning",
        mongoUser,
      };
    }

    // ReferralModel: check referrerId or referredId
    if (
      typeof document.referrerId !== "undefined" &&
      typeof document.referredId !== "undefined" &&
      typeof document.referralCode !== "undefined"
    ) {
      const isOwner =
        document.referrerId?.toString() === mongoUser._id.toString() ||
        document.referredId?.toString() === mongoUser._id.toString();
      return {
        isOwner,
        error: isOwner
          ? null
          : "You do not have permission to modify this Referral",
        mongoUser,
      };
    }

    // Subscriptions2Model: check createdBy or referrerId
    if (
      typeof document.createdBy !== "undefined" &&
      typeof document.customerId !== "undefined" &&
      typeof document.planId !== "undefined"
    ) {
      const isOwner =
        document.createdBy?.toString() === mongoUser._id.toString() ||
        document.referrerId?.toString() === mongoUser._id.toString();
      return {
        isOwner,
        error: isOwner
          ? null
          : "You do not have permission to modify this Subscription",
        mongoUser,
      };
    }

    // No ownership info
    return {
      isOwner: false,
      error: "No ownership information in document",
      mongoUser,
    };
  } catch (error) {
    console.error("Error checking document ownership:", error);
    return {
      isOwner: false,
      error: "Error checking document ownership",
      mongoUser: null,
    };
  }
}

// Add a separate export that bypasses ownership checks for self-modification of user documents
export async function checkUserSelfOwnership(document) {
  try {
    console.log("checkUserSelfOwnership called");
    const { mongoUser } = await getMongoUser();

    if (!mongoUser || !mongoUser._id) {
      console.log("No current user found");
      return {
        isOwner: false,
        error: "Not authenticated",
        mongoUser: null,
      };
    }

    // If the document is a user document and it's the current user
    if (document && document._id && mongoUser._id) {
      const isOwner = document._id.toString() === mongoUser._id.toString();
      console.log("Self ownership check result:", {
        documentId: document._id.toString(),
        currentUserId: mongoUser._id.toString(),
        match: isOwner,
      });

      return {
        isOwner,
        error: isOwner ? null : "You can only modify your own user profile",
        mongoUser,
      };
    }

    console.log("Document doesn't match criteria for self-ownership check");
    return {
      isOwner: false,
      error: "Invalid document for self-ownership check",
      mongoUser,
    };
  } catch (error) {
    console.error("Error checking self ownership:", error);
    return {
      isOwner: false,
      error: "Error checking document ownership",
      mongoUser: null,
    };
  }
}
