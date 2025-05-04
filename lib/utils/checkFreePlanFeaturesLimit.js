"use server";

import { fetchUserSubscription2 } from "@/lib/actions/fetchUserSubscription2";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import { getOne, getAll } from "@/lib/actions/crud";

/**
 * Checks if a user has access to a premium feature based on:
 * 1. Admin status (always has access)
 * 2. Having a required subscription plan
 * 3. Being within the free trial period for the feature
 *
 * @param {Object} options - Options for checking feature access
 * @param {string} options.entityId - ID of the entity (directlink, landingpage, etc.)
 * @param {string} options.entityType - Type of the entity ("directlinks", "landingpages", etc.)
 * @param {string} options.requiredPlan - Plan required for access ("creator", "agency", etc.)
 * @param {string} options.collectionName - Collection name for entities
 * @returns {Promise<Object>} - { hasAccess, reason, redirectUrl }
 */
export async function checkFreePlanFeaturesLimit({
  entityId,
  entityType,
  requiredPlan,
  collectionName,
}) {
  try {
    const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === "true";

    // Get current user and check if admin
    const { mongoUser, isAdmin } = await getMongoUser();

    // Admins always have access
    if (isAdmin) {
      return { hasAccess: true };
    }

    // Get user subscription
    const userSubscription = await fetchUserSubscription2();

    // Get the entity
    const entity = await getOne({
      col: collectionName || entityType,
      data: { _id: entityId },
    });

    if (!entity) {
      return {
        hasAccess: false,
        reason: "Entity not found",
        redirectUrl: "/",
      };
    }

    // Check if user is the creator of the entity
    const isCreator =
      entity.createdBy &&
      mongoUser._id &&
      (typeof entity.createdBy === "string"
        ? entity.createdBy === mongoUser._id.toString()
        : entity.createdBy._id &&
          entity.createdBy._id.toString() === mongoUser._id.toString());

    if (!isCreator) {
      return {
        hasAccess: false,
        reason: "Not authorized",
        redirectUrl: "/",
      };
    }

    // Check if user has the required subscription plan
    if (userSubscription) {
      // Log the subscription details for debugging
      console.log("Checking plan access:", {
        userPlanId: userSubscription.planId,
        requiredPlan,
        userSubscription: JSON.stringify(userSubscription),
      });

      // Handle special case for free plan
      if (requiredPlan === "free") {
        return { hasAccess: true };
      }

      // Determine if the user's plan matches or exceeds the required plan
      const userPlanId = userSubscription.planId || "";

      // Check if user has agency plan (any variation)
      const hasAgencyPlan =
        userPlanId === "agency" ||
        userPlanId === "price_agency_monthly" ||
        userPlanId.toLowerCase().includes("agency");

      // Check if user has creator plan (any variation)
      const hasCreatorPlan =
        userPlanId === "creator" ||
        userPlanId === "price_creator_monthly" ||
        userPlanId.toLowerCase().includes("creator");

      // Agency plan users have access to both agency and creator level features
      // Creator plan users have access to creator level features
      const planMatches =
        (requiredPlan === "creator" && (hasCreatorPlan || hasAgencyPlan)) ||
        (requiredPlan === "agency" && hasAgencyPlan);

      console.log("Plan match result:", {
        hasAgencyPlan,
        hasCreatorPlan,
        planMatches,
        requiredPlan,
      });

      if (planMatches) {
        return { hasAccess: true };
      }
    }

    // Enhanced free trial logic: allow if user has 0 or 1 directlink/landingpage and 7 days NOT passed since first creation
    // Only for directlinks and landingpages
    const isDirectLinkOrLandingPage = ["directlinks", "landingpages"].includes(entityType);
    if (isDirectLinkOrLandingPage && mongoUser?._id) {
      // Fetch all user's directlinks and landingpages
      const [userDirectlinks, userLandingpages] = await Promise.all([
        getAll({ col: "directlinks", data: { createdBy: mongoUser._id } }),
        getAll({ col: "landingpages", data: { createdBy: mongoUser._id } })
      ]);
      const allUserEntities = [...(userDirectlinks || []), ...(userLandingpages || [])];
      if (allUserEntities.length <= 1) {
        // If user has at least one, check earliest createdAt
        let earliestCreatedAt = null;
        if (allUserEntities.length === 1) {
          earliestCreatedAt = new Date(allUserEntities[0].createdAt);
        }
        if (allUserEntities.length === 0 || (earliestCreatedAt && (new Date().getTime() - earliestCreatedAt.getTime() < (isDevMode ? 1 : 7 * 24 * 60 * 60 * 1000)))) {
          return {
            hasAccess: true,
            isFreeTrialPeriod: true,
            timeRemainingMs: earliestCreatedAt ? ((isDevMode ? 1 : 7 * 24 * 60 * 60 * 1000) - (new Date().getTime() - earliestCreatedAt.getTime())) : (isDevMode ? 1 : 7 * 24 * 60 * 60 * 1000)
          };
        }
      }
    }

    // Free trial check — either 7 days or 1 second based on dev mode
    if (entity.createdAt) {
      const createdAt = new Date(entity.createdAt);
      const now = new Date();

      const trialWindow = isDevMode ? 1 : 7 * 24 * 60 * 60 * 1000; // 1s or 7 days
      const timeElapsed = now.getTime() - createdAt.getTime();

      if (timeElapsed < trialWindow) {
        return {
          hasAccess: true,
          isFreeTrialPeriod: true,
          timeRemainingMs: trialWindow - timeElapsed,
        };
      }
    }

    // No access
    return {
      hasAccess: false,
      reason: `This feature requires a ${requiredPlan || "premium"} plan`,
      redirectUrl: "/pricing",
      requiredPlan,
    };
  } catch (error) {
    console.error("Error checking free plan feature limit:", error);
    return {
      hasAccess: false,
      reason: "Error checking access",
      redirectUrl: "/",
    };
  }
}
