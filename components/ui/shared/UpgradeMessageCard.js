"use client";

import { useTranslation } from "@/components/Context/TranslationContext";
import Button2 from "@/components/ui/shared/Button/Button2";

// ! code start UpgradeMessageCard
export default function UpgradeMessageCard({
  title,
  message,
  requiredPlan,
  isFreeTrialPeriod,
  daysRemaining,
  featureName,
}) {
  const { t } = useTranslation();

  // Determine plan name display
  const planNameDisplay =
    requiredPlan === "creator"
      ? t("creatorPlan")
      : requiredPlan === "agency"
      ? t("agencyPlan")
      : t("premiumPlan");

  return (
    <div className="container mx-auto p-4 text-center">
      <div className="bg-background p-6 rounded-lg shadow-lg max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">
          {isFreeTrialPeriod ? t("freeTrialPeriod") : t(title)}
        </h1>

        {isFreeTrialPeriod ? (
          <>
            <p className="mb-4">
              {t("youHave")} {daysRemaining}{" "}
              {daysRemaining === 1 ? t("day") : t("days")} {t("remaining")}
              {featureName && ` ${t("inYourFreeTrialOf")} ${featureName}`}.
            </p>
            <p className="mb-6">
              {t("afterTrialEnds")}, {t("youWillNeed")}
              {requiredPlan ? ` ${planNameDisplay}` : t("premiumSubscription")}
              {t("toContinueUsingFeature")}.
            </p>
          </>
        ) : (
          <>
            <p className="mb-4">
              <>
                {t("thisFeatureRequires")}
                {requiredPlan
                  ? ` ${planNameDisplay}`
                  : t("premiumSubscription")}
                .
              </>
            </p>
          </>
        )}

        {process.env.NEXT_PUBLIC_DEV_MODE === "true" && (
          <p className="bad mb15">
            DEV_MODE active - must see this blocked for free users
          </p>
        )}

        <Button2
          href="/pricing"
          text={t("viewPricingPlans")}
          variant="primary"
        />
      </div>
    </div>
  );
}
// ? code end UpgradeMessageCard
