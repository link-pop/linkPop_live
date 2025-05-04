"use client";

import { useTranslation } from "@/components/Context/TranslationContext";

const AnalyticsPageHeader = ({
  profileTypeName,
  profileName,
  visitorsCount,
  isDemoMode = false,
}) => {
  const { t } = useTranslation();

  return (
    <header className="mb-8">
      <h1 className="text-2xl font-bold text-foreground">
        {t("analyticsFor")} @{profileName}
      </h1>
      <p className="text-sm text-muted-foreground mt-2">
        {isDemoMode
          ? t("demoDataShowcasingAppFeatures")
          : `${t("showingVisitorDataFromThePast")} ${
              visitorsCount > 0 ? visitorsCount : "0"
            } ${t("visits")}`}
      </p>
      <p className="text-xs text-muted-foreground italic mt-1">
        {t("noteOwnerVisitsNotTracked") ||
          "Note: Your own visits to this profile are not tracked in analytics"}
      </p>
    </header>
  );
};

export default AnalyticsPageHeader;
