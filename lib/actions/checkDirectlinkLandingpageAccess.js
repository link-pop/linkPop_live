"use server";

import { checkSubscription2Status } from "@/lib/actions/checkSubscription2Status";
import { geoBlock } from "@/lib/actions/geoBlock";
import { getAll, getOne } from "@/lib/actions/crud";
import mongoose from "mongoose";
import {
  getCurrentDateOrSimulated,
  SIMULATE_FUTURE_DATE,
} from "@/lib/utils/simulateDate";

/**
 * Checks if a visitor can access a directlink or landingpage
 * @param {Object} params - Parameters for checking access
 * @param {Object} params.entity - The directlink or landingpage entity
 * @param {string} params.entityType - "directlink" or "landingpage"
 * @param {string} params.ipAddress - Visitor's IP address
 * @param {boolean} params.isAdmin - Whether the visitor is an admin
 * @returns {Promise<{allowed: boolean, reason: string|null}>} Access result and reason if not allowed
 */
export async function checkDirectlinkLandingpageAccess({
  entity,
  entityType,
  ipAddress,
  isAdmin = false,
}) {
  if (!entity) {
    return { allowed: false, reason: "not_found" };
  }

  console.log(`Checking access for ${entityType} ${entity.name || entity._id}`);

  // Admin bypass - Admins can always access
  if (isAdmin) {
    console.log(`Admin access granted for ${entityType}`);
    return { allowed: true, reason: null };
  }

  // Track subscription status but don't return immediately
  let subscriptionCheckPassed = true;
  let subscriptionCheckReason = null;
  let subscriptionCheckMessage = null;

  // Step 1: Check if creator has valid subscription or is within free tier limits
  // - Only check for directlinks and landingpages
  // - Free tier allows 1 combined (directlinks + landingpages)
  // - Paid tiers allow more based on subscription level
  const requiresSubscriptionCheck =
    entityType === "directlink" || entityType === "landingpage";

  if (requiresSubscriptionCheck) {
    // Get the creator ID as a string
    let creatorId;
    try {
      creatorId =
        typeof entity.createdBy === "object" && entity.createdBy._id
          ? entity.createdBy._id.toString()
          : entity.createdBy instanceof mongoose.Types.ObjectId
          ? entity.createdBy.toString()
          : entity.createdBy.toString();

      console.log(
        `Checking access rights for ${entityType} (ID: ${entity._id}, Creator ID: ${creatorId})`
      );
    } catch (error) {
      console.error(`Error extracting creator ID:`, error);
      return { allowed: false, reason: "invalid_creator" };
    }

    try {
      // First check if the user has any active subscription (not trial)
      const activeSubscription = await getOne({
        col: "subscriptions2",
        data: {
          createdBy: creatorId,
          status: "active", // Only check for fully active subscriptions
        },
      });

      // If user has an active (not trial) subscription, mark subscription check as passed
      if (activeSubscription) {
        console.log(
          `Creator has active subscription - subscription check passed`
        );
        subscriptionCheckPassed = true;
      } else {
        // Check for trial subscription
        const trialSubscription = await getOne({
          col: "subscriptions2",
          data: {
            createdBy: creatorId,
            status: "trialing",
          },
        });

        // If there's a trial subscription, check if it's still valid
        if (trialSubscription && trialSubscription.trialEnd) {
          const now = getCurrentDateOrSimulated(SIMULATE_FUTURE_DATE);
          const trialEnd = new Date(trialSubscription.trialEnd);

          // If trial is still valid, mark subscription check as passed
          if (now <= trialEnd) {
            console.log(
              `Creator has valid trial subscription - subscription check passed`
            );
            subscriptionCheckPassed = true;
          } else {
            console.log(
              `Creator's trial has expired - checking free tier limits`
            );
            // Trial expired, proceed to free tier check
            subscriptionCheckPassed = false;
          }
        } else {
          // No valid subscription - check if within free tier limits (1 combined item)
          console.log(`No valid subscription - checking free tier limits`);
          subscriptionCheckPassed = false;
        }

        // If no active subscription, check free tier limits
        if (!subscriptionCheckPassed) {
          try {
            // Get all creator's directlinks and landingpages to check free tier limits
            const directlinks = await getAll({
              col: "directlinks",
              data: { createdBy: creatorId },
            });

            const landingpages = await getAll({
              col: "landingpages",
              data: { createdBy: creatorId },
            });

            const directlinksCount = directlinks?.length || 0;
            const landingpagesCount = landingpages?.length || 0;
            const totalCount = directlinksCount + landingpagesCount;

            console.log(
              `Creator has ${totalCount} items (${directlinksCount} directlinks, ${landingpagesCount} landingpages)`
            );

            // Free tier allows exactly 1 item total (directlink or landingpage)
            if (totalCount > 1) {
              // Check if this specific entity is the first one created
              let isFirstItem = false;

              if (entityType === "directlink" && directlinks.length > 0) {
                // Sort by creation date and check if this is the first one
                const sortedDirectlinks = [...directlinks].sort(
                  (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
                );
                isFirstItem =
                  sortedDirectlinks[0]._id.toString() === entity._id.toString();
              } else if (
                entityType === "landingpage" &&
                landingpages.length > 0
              ) {
                // Sort by creation date and check if this is the first one
                const sortedLandingpages = [...landingpages].sort(
                  (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
                );
                isFirstItem =
                  sortedLandingpages[0]._id.toString() ===
                  entity._id.toString();
              }

              // If not the first item and no subscription, mark as failed
              if (!isFirstItem) {
                console.log(
                  `Free tier limit exceeded and not the first item - subscription check failed`
                );
                subscriptionCheckPassed = false;
                subscriptionCheckReason = "subscription_required";
                subscriptionCheckMessage = `Subscription required for ${entityType} ${entity.name}`;
              } else {
                console.log(
                  `This is the first created item - allowed on free tier`
                );
                subscriptionCheckPassed = true;
              }
            } else {
              console.log(`Within free tier limit - subscription check passed`);
              subscriptionCheckPassed = true;
            }
          } catch (error) {
            console.error(`Error checking free tier limits:`, error);
            // In case of error checking free tier, mark as failed
            subscriptionCheckPassed = false;
            subscriptionCheckReason = "subscription_required";
            subscriptionCheckMessage = `Subscription verification failed for ${entityType} ${entity.name}`;
          }
        }
      }
    } catch (error) {
      console.error(`Error checking subscription status:`, error);
      // On subscription check error, mark as failed
      subscriptionCheckPassed = false;
      subscriptionCheckReason = "subscription_error";
      subscriptionCheckMessage = `Subscription verification failed for ${entityType} ${entity.name}`;
    }
  }

  // Step 2: Check geo blocking restrictions
  console.log(`Checking geo blocking for ${entityType}: ${entity._id}`);
  console.log(`Visitor IP address: "${ipAddress}"`);

  let geoBlockCheckPassed = true;
  let geoBlockReason = null;
  let geoBlockMessage = null;

  try {
    const geoBlockResult = await geoBlock(ipAddress, entity._id, entityType);
    console.log(`Geo blocking result for ${entityType}:`, geoBlockResult);

    if (geoBlockResult.isBlocked) {
      console.log(
        `Geo blocking check failed - visitor is blocked from this location`
      );
      geoBlockCheckPassed = false;
      geoBlockReason = "geo_blocked";
      geoBlockMessage = `Access blocked for ${entityType} ${entity.name} from this location`;
    } else {
      console.log(`Geo blocking check passed - visitor location is allowed`);
    }
  } catch (error) {
    console.error(`Error during geo blocking check:`, error);
    // Don't block access due to error in geo blocking
  }

  // Final access decision - both checks must pass
  if (!subscriptionCheckPassed) {
    console.log(`Access denied: Subscription check failed`);
    return {
      allowed: false,
      reason: subscriptionCheckReason,
      message: subscriptionCheckMessage,
    };
  }

  if (!geoBlockCheckPassed) {
    console.log(`Access denied: Geo blocking check failed`);
    return {
      allowed: false,
      reason: geoBlockReason,
      message: geoBlockMessage,
    };
  }

  // All checks passed
  console.log(`Access granted for ${entityType} ${entity.name || entity._id}`);
  return { allowed: true, reason: null };
}
