"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/components/Context/TranslationContext";
import { BRAND_INVERT_CLASS } from "@/lib/utils/constants";
import HorizontalScroll from "@/components/ui/shared/HorizontalScroll";
import { SITE1 } from "@/config/env";
import { getAll } from "@/lib/actions/crud";

export default function SubscriptionTypeSwitch({
  mongoUser,
  className = "",
  horizontalScrollstyle = {},
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const types = [
    { value: "all", label: "allSubscriptions", hideCount: false },
    { value: "active", label: "activeSubscriptions", hideCount: false },
    { value: "expired", label: "expiredSubscriptions", hideCount: false },
  ];

  // Use react-query to fetch and cache the counts
  const {
    data: counts = types.reduce((acc, type) => {
      acc[type.value] = 0;
      return acc;
    }, {}),
  } = useQuery({
    queryKey: ["subscriptionCounts", mongoUser?._id],
    queryFn: async () => {
      if (!mongoUser?._id)
        return types.reduce((acc, type) => {
          acc[type.value] = 0;
          return acc;
        }, {});

      try {
        const now = new Date();

        // Get all subscriptions for the user
        const allSubscriptions = await getAll({
          col: "subscriptions",
          data: { createdBy: mongoUser._id },
        });

        // Count active subscriptions (not expired)
        const activeSubscriptions = allSubscriptions.filter((sub) => {
          if (!sub.expiresAt) return true; // No expiration date means active
          return new Date(sub.expiresAt) > now;
        });

        // Count expired subscriptions
        const expiredSubscriptions = allSubscriptions.filter((sub) => {
          if (!sub.expiresAt) return false; // No expiration date means not expired
          return new Date(sub.expiresAt) <= now;
        });

        return {
          all: allSubscriptions.length,
          active: activeSubscriptions.length,
          expired: expiredSubscriptions.length,
        };
      } catch (error) {
        console.error("❌ Error fetching subscription counts:", error);
        return types.reduce((acc, type) => {
          acc[type.value] = 0;
          return acc;
        }, {});
      }
    },
    enabled: Boolean(mongoUser?._id),
  });

  function handleTypeChange(value) {
    const params = new URLSearchParams(searchParams);

    if (value === "all") {
      params.delete("subscriptionType");
    } else {
      params.set("subscriptionType", value);
    }

    router.push(`?${params.toString()}`);
  }

  const typeParam = searchParams.get("subscriptionType");
  const currentValue = typeParam || "all";

  return (
    <div className={`px15 maw600 wf oxa f g5 ${className}`}>
      <HorizontalScroll
        className={`px10 pb8 g15`}
        style={horizontalScrollstyle}
      >
        {types.map((type) => (
          <div
            key={type.value}
            onClick={() => handleTypeChange(type.value)}
            className={`wsn py5 px15 br20 cp flex-shrink-0 transition-colors ${
              currentValue === type.value
                ? "bg_brand"
                : "bg-accent hover:bg-accent/50"
            }`}
          >
            <span className={`${SITE1 ? BRAND_INVERT_CLASS : ""}`}>
              {t(type.label)} {!type.hideCount ? ` ${counts[type.value]}` : ""}
            </span>
          </div>
        ))}
      </HorizontalScroll>
    </div>
  );
}
