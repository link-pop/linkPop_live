// Generate details for the subscription limits UI display
export function getSubscription2DisplayInfo(limitCheck) {
  if (!limitCheck) return null;

  const {
    directlinksCount = 0,
    landingpagesCount = 0,
    limit = 0,
    planName = "",
    remaining = 0,
    used = 0,
    subscription,
    isAdmin = false,
  } = limitCheck;

  const isTrialActive = subscription?.status === "trialing";
  const isTrialExpired = isTrialActive && subscription?.trialDaysRemaining <= 0;
  const extraLinks = subscription?.extraLinks || 0;

  // Special handling for admin users (unlimited)
  if (isAdmin) {
    return {
      messageType: "info",
      className: "bg-accent text-green-400",
      statusMessage: "Admin: Unlimited links and landing pages",
      linksData: {
        used: 0,
        limit: Infinity,
        directlinksCount,
        landingpagesCount,
        remaining: Infinity,
      },
      needsUpgrade: false,
      planName: planName || "Admin (Unlimited)",
      isTrialActive: false,
      isTrialExpired: false,
      isAdmin: true,
    };
  }

  return {
    messageType: remaining === 0 || isTrialExpired ? "error" : "info",
    className:
      remaining === 0 || isTrialExpired
        ? "bg-accent text-red-600"
        : "bg-accent text-foreground",
    statusMessage:
      extraLinks > 0
        ? `Links usage summary (including ${extraLinks} extra links)`
        : "Links usage summary",
    linksData: {
      used,
      limit,
      directlinksCount,
      landingpagesCount,
      remaining,
      extraLinks,
    },
    needsUpgrade: remaining === 0 || isTrialExpired,
    planName,
    isTrialActive,
    isTrialExpired,
    isAdmin: false,
  };
}

// Generate upgrade path suggestions based on subscription
export function getSubscription2UpgradeSuggestion(subscription) {
  if (!subscription) {
    return {
      message:
        "Upgrade to Creator plan for up to 5 combined links and landing pages",
      planTarget: "creator-monthly",
    };
  }

  const isTrialActive = subscription.status === "trialing";
  const isTrialExpired = isTrialActive && subscription.trialDaysRemaining <= 0;

  if (isTrialExpired) {
    return {
      message:
        "Your trial has expired. Please upgrade to continue using premium features.",
      planTarget: "creator-monthly",
      isTrialActive: false,
      isTrialExpired: true,
    };
  }

  const trialPrefix = isTrialActive ? "After your trial ends, " : "";

  if (subscription.planId === "price_creator_monthly") {
    return {
      message: `${trialPrefix}Upgrade to Agency plan for up to 50 combined links and landing pages`,
      planTarget: "agency-monthly",
      isTrialActive,
      isTrialExpired,
    };
  }

  if (subscription.planId === "price_agency_monthly") {
    const currentLinks = subscription.extraLinks
      ? 50 + subscription.extraLinks
      : 50;

    if (currentLinks < 500) {
      return {
        message: `${trialPrefix}Upgrade your Agency plan to get more links (current: ${currentLinks}, max: 500)`,
        planTarget: "agency-monthly-upgrade",
        isTrialActive,
        isTrialExpired,
        currentLinks,
      };
    }
  }

  return {
    message: `${trialPrefix}You've reached the maximum number of combined links and landing pages`,
    planTarget: null,
    isTrialActive,
    isTrialExpired,
  };
}
