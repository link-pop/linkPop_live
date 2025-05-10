"use client";

import React from "react";
import ProfileNotFound from "./ProfileNotFound";
import { PRICING_ROUTE } from "@/lib/utils/constants";
import Link from "next/link";
import { useTranslation } from "@/components/Context/TranslationContext";

/**
 * Component to display when a profile is not accessible due to subscription issues
 * @param {Object} props - Component props
 * @param {string} props.entityType - Type of entity: "link", "landingpage", or "profile"
 * @returns {JSX.Element} The SubscriptionExpiredMessage component
 */
export default function SubscriptionExpiredMessage({ entityType = "profile" }) {
  const { t } = useTranslation();

  // Determine entity-specific text
  let entityText = t("thisProfile", "This profile");
  if (entityType === "link") {
    entityText = t("thisLink", "This link");
  } else if (entityType === "landingpage") {
    entityText = t("thisLandingPage", "This landing page");
  }

  return (
    <ProfileNotFound
      customTitle={t("subscriptionExpired", "Subscription Expired")}
      customMessage={
        <div className="mb20">
          <p className="fz18 tac mb10 fw500">
            {entityText}{" "}
            {t("isNotAvailableBecause", "is not available because:")}
          </p>
          <ul className="list-disc pl-5">
            <li>
              {t(
                "creatorsSubscriptionExpired",
                "The creator's subscription has expired"
              )}
            </li>
            <li>
              {t(
                "subscriptionPlanLimitExceeded",
                "The subscription plan limit has been exceeded"
              )}
            </li>
          </ul>
          <p className="mt15">
            {t("ifYouAreCreatorPlease", "If you are the creator, please")}{" "}
            <Link className="brand underline" href={PRICING_ROUTE}>
              {t("updateYourSubscription", "update your subscription")}
            </Link>
          </p>
        </div>
      }
    />
  );
}
