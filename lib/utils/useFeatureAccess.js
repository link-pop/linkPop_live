import { useEffect, useState } from "react";
import { checkFreePlanFeaturesLimit } from "@/lib/utils/checkFreePlanFeaturesLimit";

/**
 * React hook to check feature access for a user/entity.
 * Handles loading, error, and access state.
 *
 * @param {Object} params
 * @param {string} params.entityId - ID of the entity
 * @param {string} params.entityType - Type of the entity ("directlinks", "landingpages", etc.)
 * @param {string} params.requiredPlan - Plan required for access ("creator", "agency", etc.)
 * @returns {Object} { hasAccess, isChecking, isFreeTrialPeriod, reason, timeRemainingMs, error }
 */
export function useFeatureAccess({ entityId, entityType, requiredPlan }) {
  const [state, setState] = useState({
    hasAccess: false,
    isChecking: true,
    isFreeTrialPeriod: false,
    reason: "",
    timeRemainingMs: 0,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    async function checkAccess() {
      setState((prev) => ({ ...prev, isChecking: true, error: null }));
      try {
        const result = await checkFreePlanFeaturesLimit({
          entityId,
          entityType,
          requiredPlan,
        });
        if (!cancelled) {
          setState({
            ...result,
            isChecking: false,
            error: null,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setState((prev) => ({
            ...prev,
            isChecking: false,
            error: err.message || "Error checking feature access",
          }));
        }
      }
    }
    if (entityId && entityType && requiredPlan) {
      checkAccess();
    } else {
      setState((prev) => ({ ...prev, isChecking: false, hasAccess: false, reason: "Missing parameters" }));
    }
    return () => {
      cancelled = true;
    };
  }, [entityId, entityType, requiredPlan]);

  return state;
}
