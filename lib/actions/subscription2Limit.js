import { getAll } from "@/lib/actions/crud";
import {
  getCurrentDateOrSimulated,
  SIMULATE_FUTURE_DATE,
} from "@/lib/utils/simulateDate";

// Fetch user's subscription, directlinks and landingpages
export async function fetchUserDirectlinkLandingpageData(userId) {
  if (!userId) {
    return { subscription: null, directlinks: [], landingpages: [] };
  }

  try {
    // Get user's subscription
    const subscriptions = await getAll({
      col: "subscriptions2",
      data: {
        createdBy: userId,
        status: { $in: ["active", "trialing"] },
      },
    });

    let subscription = subscriptions?.[0] || null;

    // Add trial expiration check for server-side safety
    if (
      subscription &&
      subscription.status === "trialing" &&
      subscription.trialEnd
    ) {
      // Get current date or simulated future date if testing
      const now = getCurrentDateOrSimulated(SIMULATE_FUTURE_DATE);

      const trialEnd = new Date(subscription.trialEnd);
      const daysRemaining = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));
      subscription.trialDaysRemaining = daysRemaining;
      subscription.trialDaysRemainingDisplay =
        daysRemaining > 0 ? daysRemaining : 0;
      subscription.isTrialExpired = daysRemaining <= 0;
    }

    // Get user's existing directlinks
    const directlinks = await getAll({
      col: "directlinks",
      data: { createdBy: userId },
    });

    // Get user's existing landingpages
    const landingpages = await getAll({
      col: "landingpages",
      data: { createdBy: userId },
    });

    return {
      subscription,
      directlinks: directlinks || [],
      landingpages: landingpages || [],
    };
  } catch (error) {
    console.error("Error fetching user directlink data:", error);
    return { subscription: null, directlinks: [], landingpages: [] };
  }
}

// Check if user is within their subscription limit for directlinks and landingpages combined
export function checkSubscription2Limit(
  subscription,
  directlinks,
  landingpages,
  isUpdateMode,
  user // optional, expects mongoUser with isAdmin property
) {
  // Unlimited for admin users
  if (user?.isAdmin) {
    return {
      withinLimits: true,
      limit: Infinity,
      used: 0,
      remaining: Infinity,
      planName: "Admin (Unlimited)",
      directlinksCount: directlinks?.length || 0,
      landingpagesCount: landingpages?.length || 0,
      isTrialActive: false,
      isTrialExpired: false,
      isAdmin: true,
    };
  }

  // If updating, no need to check limits
  if (isUpdateMode) {
    return { withinLimits: true };
  }

  let limit = 1; // Free plan default
  let planName = "Free";
  let isTrialActive = false;
  let isTrialExpired = false;

  // Determine limit based on subscription
  if (subscription) {
    // Check if this is a trial and if it's expired
    isTrialActive = subscription.status === "trialing";

    // Check if trial has expired based on trialDaysRemaining
    if (isTrialActive && subscription.trialDaysRemaining <= 0) {
      isTrialExpired = true;
      // Expired trial should be treated as no subscription (free plan limits)
      limit = 1;
      planName = "Free (Trial Expired)";
    } else if (subscription.planId === "price_creator_monthly") {
      limit = 5;
      planName = isTrialActive ? "Creator (Trial)" : "Creator";
    } else if (subscription.planId === "price_agency_monthly") {
      // Default limit for agency plan is 50, but check for extraLinks
      limit = subscription.extraLinks ? 50 + subscription.extraLinks : 50;
      planName = isTrialActive ? "Agency (Trial)" : "Agency";
    }
  }

  // Calculate combined usage of directlinks and landingpages
  const directlinksCount = directlinks?.length || 0;
  const landingpagesCount = landingpages?.length || 0;
  const used = directlinksCount + landingpagesCount;

  const remaining = Math.max(0, limit - used);
  const withinLimits = used < limit;

  return {
    withinLimits,
    limit,
    used,
    remaining,
    planName,
    directlinksCount,
    landingpagesCount,
    isTrialActive,
    isTrialExpired,
  };
}

// Get message explaining subscription limits
export function getSubscription2LimitMessage(subscription) {
  if (!subscription) {
    return "You need to upgrade to create more than 1 link or landing page. Please upgrade your subscription.";
  }

  const isTrialActive = subscription.status === "trialing";
  const isTrialExpired = isTrialActive && subscription.trialDaysRemaining <= 0;

  if (isTrialExpired) {
    return "Your trial has expired. Please upgrade to a paid subscription to create more links.";
  }

  const trialSuffix = isTrialActive ? " Your trial is active." : "";

  if (subscription.planId === "price_creator_monthly") {
    return `Creator plan allows up to 5 combined links and landing pages. Please upgrade to the Agency plan for more.${trialSuffix}`;
  }

  if (subscription.planId === "price_agency_monthly") {
    const limit = subscription.extraLinks ? 50 + subscription.extraLinks : 50;
    return `Agency plan allows up to ${limit} combined links and landing pages.${trialSuffix}`;
  }

  return "You've reached your direct link and landing page limit. Please upgrade your subscription.";
}
