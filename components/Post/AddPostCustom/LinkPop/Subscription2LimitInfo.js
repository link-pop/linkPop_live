"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "@/components/Context/TranslationContext";

export default function Subscription2LimitInfo({ displayInfo, errors }) {
  const router = useRouter();
  const { t } = useTranslation();

  if (!displayInfo || displayInfo.isAdmin) return null;

  // Format the links usage message with proper translations
  const formatLinksUsageMessage = () => {
    if (displayInfo.isAdmin) {
      return (
        t("adminUnlimitedLinks") || "Unlimited links and landing pages (Admin)"
      );
    }
    if (!displayInfo.linksData) return displayInfo.statusMessage;

    const {
      used,
      limit,
      directlinksCount,
      landingpagesCount,
      remaining,
      extraLinks,
    } = displayInfo.linksData;

    const extraLinksText =
      extraLinks > 0 ? ` (including ${extraLinks} extra links)` : "";

    return `${used} ${t("limitOf")} ${limit}${extraLinksText} ${t(
      "linksUsed"
    )} (${directlinksCount} ${t("directLinks")}, ${landingpagesCount} ${t(
      "landingPages"
    )}, ${remaining} ${t("remaining")})`;
  };

  return (
    <>
      <div
        className={`👋 maw600 wf mxa p15 mb-4 p-3 rounded-md ${displayInfo.className}`}
      >
        <p className="text-sm">
          <span className="font-medium">
            {displayInfo.linksData
              ? formatLinksUsageMessage()
              : displayInfo.statusMessage}
          </span>

          {displayInfo.isTrialExpired && (
            <span className="block mt-1 text-red-500 font-medium">
              {t("trialHasExpired")}
            </span>
          )}

          {displayInfo.isTrialActive && !displayInfo.isTrialExpired && (
            <span className="block mt-1 text-orange-500 font-medium">
              {t("trialSubscriptionActive")}
            </span>
          )}

          {/* Hide upgrade for admin users */}
          {!displayInfo.isAdmin &&
            (displayInfo.needsUpgrade || displayInfo.isTrialExpired) && (
              <span className="block mt-1">
                {t("upgradeSubscriptionText")}
                <button
                  onClick={() => router.push("/pricing")}
                  className="brand db mt15 mxa underline font-medium"
                >
                  {t("upgradeNowBtn")}
                </button>
              </span>
            )}
        </p>
      </div>

      {errors?.subscription && (
        <div className="text-red-500 text-sm mb-4">{errors.subscription}</div>
      )}
    </>
  );
}
