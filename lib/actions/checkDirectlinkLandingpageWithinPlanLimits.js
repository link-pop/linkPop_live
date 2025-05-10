"use server";

import { getAll } from "@/lib/actions/crud";

/**
 * for SITE2
 * Checks if an entity is within the plan limits based on creation date order
 * @param {string} entityId - ID of the entity to check
 * @param {string} entityType - Type of entity ("directlink" or "landingpage")
 * @param {string} creatorId - Creator's ID
 * @param {Object} subscription - Subscription object with planId and extraLinks
 * @returns {Promise<{isWithinLimit: boolean, reason: string|null, message: string|null, planLimit: number}>}
 */
export async function checkDirectlinkLandingpageWithinPlanLimits(
  entityId,
  entityType,
  creatorId,
  subscription
) {
  console.log(
    `Checking if ${entityType} (${entityId}) is within plan limits for creator ${creatorId}`
  );

  // Get all creator's directlinks and landingpages
  const directlinks = await getAll({
    col: "directlinks",
    data: { createdBy: creatorId },
  });

  const landingpages = await getAll({
    col: "landingpages",
    data: { createdBy: creatorId },
  });

  console.log(
    `Found ${directlinks?.length || 0} directlinks and ${
      landingpages?.length || 0
    } landingpages`
  );

  // Sort items by creation date (oldest first)
  const sortedDirectlinks = directlinks
    ? [...directlinks].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      )
    : [];

  const sortedLandingpages = landingpages
    ? [...landingpages].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      )
    : [];

  // Combine and sort all items by creation date
  const allItems = [
    ...sortedDirectlinks.map((item) => ({ ...item, type: "directlink" })),
    ...sortedLandingpages.map((item) => ({ ...item, type: "landingpage" })),
  ].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  // Determine current subscription plan limit
  let planLimit = 1; // Default free tier limit
  let planName = "Free";

  if (subscription) {
    if (subscription.planId === "price_creator_monthly") {
      planLimit = 5;
      planName = "Creator";
    } else if (subscription.planId === "price_agency_monthly") {
      planLimit = subscription.extraLinks ? 50 + subscription.extraLinks : 50;
      planName = "Agency";
    }
  }

  console.log(`Current plan: ${planName} with limit of ${planLimit} items`);

  // Find the position of this entity in the chronologically sorted list
  const entityPosition = allItems.findIndex(
    (item) =>
      item._id.toString() === entityId.toString() && item.type === entityType
  );

  if (entityPosition === -1) {
    console.log(`Entity not found in the list of user's entities`);
    return {
      isWithinLimit: false,
      reason: "entity_not_found",
      message: `This ${entityType} could not be found in your account`,
      planLimit,
    };
  }

  console.log(
    `Entity position in chronological order: ${entityPosition + 1} of ${
      allItems.length
    }`
  );

  // Check if this entity's position is within the current plan limit
  // Only entities with positions 0 to (planLimit-1) are accessible
  if (entityPosition < planLimit) {
    console.log(
      `Entity is within current plan limit (position ${
        entityPosition + 1
      } <= limit ${planLimit})`
    );
    return {
      isWithinLimit: true,
      reason: null,
      message: null,
      planLimit,
    };
  } else {
    console.log(
      `Entity exceeds current plan limit (position ${
        entityPosition + 1
      } > limit ${planLimit})`
    );

    // Check if this might be due to a plan downgrade
    const totalEntities = allItems.length;
    if (totalEntities > planLimit) {
      console.log(
        `User has ${totalEntities} total entities but current plan only allows ${planLimit}`
      );
      return {
        isWithinLimit: false,
        reason: "plan_downgraded",
        message: `Your current ${
          subscription?.status === "trialing" ? "trial " : ""
        }plan only allows ${planLimit} ${
          entityType === "directlink" ? "directlinks" : "landing pages"
        } (based on creation date). This ${entityType} exceeds that limit.`,
        planLimit,
      };
    } else {
      return {
        isWithinLimit: false,
        reason: "subscription_limit_exceeded",
        message: `This ${entityType} exceeds your current ${
          subscription?.status === "trialing" ? "trial " : ""
        }plan limit (${planLimit})`,
        planLimit,
      };
    }
  }
}
