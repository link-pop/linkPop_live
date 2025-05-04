/**
 * Utility functions for subscription payment calculations
 */

/**
 * Returns the amount that should be displayed in the "Paid" column and used for revenue calculations
 * @param {Object} sub - The subscription object
 * @param {Array} allSubscriptions - All subscriptions for lookups
 * @returns {number} The amount to be counted for revenue
 *
 * Note: When calculating referral commissions, this function should be used to determine
 * the base amount on which commissions should be calculated. Commissions should only apply
 * to the actual amounts paid (not $0 payments from plan changes or trials).
 */
export function getPaymentAmount(sub, allSubscriptions) {
  // For subscriptions with isChangingPlan=true, the paid amount is $0
  if (
    sub.metadata?.isChangingPlan === "true" ||
    sub.metadata?.isChangingPlan === true
  ) {
    return 0; // "Upgrade $0.00" or "Downgrade $0.00"
  }

  // For trial subscriptions, no payment was made
  if (sub.status === "trialing") {
    return 0; // "Trial $0.00"
  }

  // For canceled trials, no payment was made
  if (
    (sub.status === "canceled" || sub.cancelAtPeriodEnd) &&
    sub.trialEnd &&
    (new Date(sub.canceledAt) < new Date(sub.trialEnd) || sub.cancelAtPeriodEnd)
  ) {
    return 0; // Canceled during trial period
  }

  // For active subscriptions that came from plan changes, it's $0
  if (sub.status === "active" && sub.metadata?.previousSubscriptionId) {
    // Find the previous subscription
    const prevSub = allSubscriptions.find((s) => {
      if (!s._id || !sub.metadata?.previousSubscriptionId) return false;
      return (
        s._id.toString() === sub.metadata.previousSubscriptionId.toString()
      );
    });

    if (
      prevSub &&
      prevSub.status === "canceled" &&
      (prevSub.metadata?.cancelReason === "plan_change" ||
        prevSub.cancelReason === "plan_change" ||
        prevSub.cancelReason === "extra_links_increase" ||
        prevSub.cancelReason === "extra_links_decrease")
    ) {
      return 0; // Credit from previous plan
    }
  }

  // For canceled subscriptions that were changed to another plan,
  // these actually show the full amount as "Initial payment"
  if (
    sub.status === "canceled" &&
    (sub.cancelReason === "plan_change" ||
      sub.cancelReason === "plan_upgrade" ||
      sub.cancelReason === "plan_downgrade" ||
      sub.cancelReason === "extra_links_increase" ||
      sub.cancelReason === "extra_links_decrease" ||
      (sub.metadata &&
        (sub.metadata.cancelReason === "plan_change" ||
          sub.metadata.cancelReason === "plan_upgrade" ||
          sub.metadata.cancelReason === "plan_downgrade" ||
          sub.metadata.cancelReason === "extra_links_increase" ||
          sub.metadata.cancelReason === "extra_links_decrease")))
  ) {
    // Find the subscription that replaced this one
    const nextSub = allSubscriptions.find((s) => {
      if (!s.metadata?.previousSubscriptionId || !sub._id) return false;
      return s.metadata.previousSubscriptionId === sub._id.toString();
    });

    if (nextSub) {
      // If this was a trial that was upgraded/changed, it should be $0
      if (sub.trialEnd) {
        return 0; // No payment for trial that was upgraded/changed
      }

      // This is the case where it shows the amount with "Initial payment" note
      return sub.amount || 0;
    }
  }

  // Default case: just the amount (for active subscriptions with real payments)
  if (sub.status === "active") {
    return sub.amount || 0;
  }

  return 0; // Any other case, assume $0
}

/**
 * Returns formatted payment information for display in the UI
 * @param {Object} sub - The subscription object
 * @param {Array} allSubscriptions - All subscriptions for lookups
 * @returns {Object} Payment info with text, class, and notes
 */
export function getPaymentInfo(sub, allSubscriptions) {
  // For active subscriptions that have isChangingPlan=true, show upgrade/downgrade with $0
  if (
    sub.metadata?.isChangingPlan === "true" ||
    sub.metadata?.isChangingPlan === true
  ) {
    const prevPlanId = sub.metadata.previousPlanId || "";
    const currPlanId = sub.planId || "";

    // Check if this is an extraLinks change on the same plan
    if (prevPlanId === currPlanId && sub.metadata.extraLinks !== undefined) {
      // Find previous subscription to compare extraLinks
      const prevSub = allSubscriptions.find((s) => {
        if (!s._id || !sub.metadata?.previousSubscriptionId) return false;
        return (
          s._id.toString() === sub.metadata.previousSubscriptionId.toString()
        );
      });

      if (prevSub) {
        const prevExtraLinks = prevSub.extraLinks || 0;
        const currExtraLinks = sub.extraLinks || 0;

        if (currExtraLinks > prevExtraLinks) {
          return {
            text: "Links Upgrade $0.00",
            class: "text-blue-500",
            previousPlan: prevPlanId,
            note: "Credit from previous plan",
            extraLinksChange: `Added ${currExtraLinks - prevExtraLinks} links`,
          };
        } else if (currExtraLinks < prevExtraLinks) {
          return {
            text: "Links Reduction $0.00",
            class: "text-yellow-500",
            previousPlan: prevPlanId,
            note: "Credit from previous plan",
            extraLinksChange: `Removed ${
              prevExtraLinks - currExtraLinks
            } links`,
          };
        }
      }
    }

    // Determine if upgrade or downgrade (plan change)
    if (prevPlanId.includes("agency") && currPlanId.includes("creator")) {
      return {
        text: "Downgrade $0.00",
        class: "text-red-500",
        previousPlan: prevPlanId,
        note: "Credit from previous plan",
      };
    } else if (
      prevPlanId.includes("creator") &&
      currPlanId.includes("agency")
    ) {
      return {
        text: "Upgrade $0.00",
        class: "text-blue-500",
        previousPlan: prevPlanId,
        note: "Credit from previous plan",
      };
    } else {
      return {
        text: "Plan Change $0.00",
        class: "text-blue-500",
        previousPlan: prevPlanId,
        note: "Credit from previous plan",
      };
    }
  }

  // For trial subscriptions, no payment was made
  if (sub.status === "trialing") {
    return { text: "Trial $0.00", class: "text-orange-500" };
  }

  // For canceled trials, no payment was made
  if (
    (sub.status === "canceled" || sub.cancelAtPeriodEnd) &&
    sub.trialEnd &&
    (new Date(sub.canceledAt) < new Date(sub.trialEnd) || sub.cancelAtPeriodEnd)
  ) {
    // Determine if it was upgraded or downgraded
    if (
      sub.cancelReason === "plan_upgrade" ||
      sub.metadata?.cancelReason === "plan_upgrade"
    ) {
      return {
        text: "Trial $0.00",
        class: "text-orange-500",
        note: "Canceled for upgrade",
      };
    } else if (
      sub.cancelReason === "plan_downgrade" ||
      sub.metadata?.cancelReason === "plan_downgrade"
    ) {
      return {
        text: "Trial $0.00",
        class: "text-orange-500",
        note: "Canceled for downgrade",
      };
    } else if (
      sub.cancelReason === "extra_links_increase" ||
      sub.metadata?.cancelReason === "extra_links_increase"
    ) {
      return {
        text: "Trial $0.00",
        class: "text-orange-500",
        note: "Canceled to add links",
      };
    } else if (
      sub.cancelReason === "extra_links_decrease" ||
      sub.metadata?.cancelReason === "extra_links_decrease"
    ) {
      return {
        text: "Trial $0.00",
        class: "text-orange-500",
        note: "Canceled to remove links",
      };
    } else {
      return { text: "Canceled Trial $0.00", class: "text-orange-500" };
    }
  }

  // For active subscriptions that came from plan changes (metadata has previousSubscriptionId)
  if (sub.status === "active" && sub.metadata?.previousSubscriptionId) {
    // Find the previous subscription
    const prevSub = allSubscriptions.find((s) => {
      if (!s._id || !sub.metadata?.previousSubscriptionId) return false;
      return (
        s._id.toString() === sub.metadata.previousSubscriptionId.toString()
      );
    });

    if (prevSub) {
      // If previous subscription was for a payment, this one is prorated
      if (
        prevSub.status === "canceled" &&
        (prevSub.metadata?.cancelReason === "plan_change" ||
          prevSub.cancelReason === "plan_change" ||
          prevSub.cancelReason === "extra_links_increase" ||
          prevSub.cancelReason === "extra_links_decrease")
      ) {
        // Check if it's an extraLinks change on the same plan
        if (prevSub.planId === sub.planId) {
          const prevExtraLinks = prevSub.extraLinks || 0;
          const currExtraLinks = sub.extraLinks || 0;

          if (currExtraLinks > prevExtraLinks) {
            return {
              text: "Links Upgrade $0.00",
              class: "text-blue-500",
              previousPlan: prevSub.planId,
              note: "Credit from previous plan",
              extraLinksChange: `Added ${
                currExtraLinks - prevExtraLinks
              } links`,
            };
          } else if (currExtraLinks < prevExtraLinks) {
            return {
              text: "Links Reduction $0.00",
              class: "text-yellow-500",
              previousPlan: prevSub.planId,
              note: "Credit from previous plan",
              extraLinksChange: `Removed ${
                prevExtraLinks - currExtraLinks
              } links`,
            };
          }
        }

        // Check if it's an upgrade or downgrade (plan change)
        if (
          prevSub.planId?.includes("agency") &&
          sub.planId?.includes("creator")
        ) {
          return {
            text: "Downgrade $0.00",
            class: "text-red-500",
            previousPlan: prevSub.planId,
            note: "Credit from previous plan",
          };
        } else if (
          prevSub.planId?.includes("creator") &&
          sub.planId?.includes("agency")
        ) {
          return {
            text: "Upgrade $0.00",
            class: "text-blue-500",
            previousPlan: prevSub.planId,
            note: "Credit from previous plan",
          };
        } else {
          return {
            text: "Plan Change $0.00",
            class: "text-green-500",
            previousPlan: prevSub.planId,
            note: "Credit from previous plan",
          };
        }
      }
    }
  }

  // For canceled subscriptions that were changed to another plan
  if (
    sub.status === "canceled" &&
    (sub.cancelReason === "plan_change" ||
      sub.cancelReason === "plan_upgrade" ||
      sub.cancelReason === "plan_downgrade" ||
      sub.cancelReason === "extra_links_increase" ||
      sub.cancelReason === "extra_links_decrease" ||
      (sub.metadata &&
        (sub.metadata.cancelReason === "plan_change" ||
          sub.metadata.cancelReason === "plan_upgrade" ||
          sub.metadata.cancelReason === "plan_downgrade" ||
          sub.metadata.cancelReason === "extra_links_increase" ||
          sub.metadata.cancelReason === "extra_links_decrease")))
  ) {
    // Find the subscription that replaced this one
    const nextSub = allSubscriptions.find((s) => {
      if (!s.metadata?.previousSubscriptionId || !sub._id) return false;
      return s.metadata.previousSubscriptionId === sub._id.toString();
    });

    if (nextSub) {
      // If this was a trial that was canceled for upgrade/downgrade
      if (sub.trialEnd) {
        if (
          sub.cancelReason === "plan_downgrade" ||
          (sub.metadata && sub.metadata.cancelReason === "plan_downgrade")
        ) {
          return {
            text: "Trial $0.00",
            class: "text-orange-500",
            note: "Canceled for downgrade",
            nextPlan: nextSub.planId,
          };
        } else if (
          sub.cancelReason === "plan_upgrade" ||
          (sub.metadata && sub.metadata.cancelReason === "plan_upgrade")
        ) {
          return {
            text: "Trial $0.00",
            class: "text-orange-500",
            note: "Canceled for upgrade",
            nextPlan: nextSub.planId,
          };
        } else if (
          sub.cancelReason === "extra_links_increase" ||
          (sub.metadata && sub.metadata.cancelReason === "extra_links_increase")
        ) {
          const nextExtraLinks = nextSub.extraLinks || 0;
          const thisExtraLinks = sub.extraLinks || 0;
          return {
            text: "Trial $0.00",
            class: "text-orange-500",
            note: `Canceled to add ${nextExtraLinks - thisExtraLinks} links`,
            nextPlan: nextSub.planId,
            extraLinksChange: `Added ${nextExtraLinks - thisExtraLinks} links`,
          };
        } else if (
          sub.cancelReason === "extra_links_decrease" ||
          (sub.metadata && sub.metadata.cancelReason === "extra_links_decrease")
        ) {
          const nextExtraLinks = nextSub.extraLinks || 0;
          const thisExtraLinks = sub.extraLinks || 0;
          return {
            text: "Trial $0.00",
            class: "text-orange-500",
            note: `Canceled to remove ${thisExtraLinks - nextExtraLinks} links`,
            nextPlan: nextSub.planId,
            extraLinksChange: `Removed ${
              thisExtraLinks - nextExtraLinks
            } links`,
          };
        } else {
          // Check if it's an extraLinks change
          if (sub.planId === nextSub.planId) {
            const nextExtraLinks = nextSub.extraLinks || 0;
            const thisExtraLinks = sub.extraLinks || 0;

            if (nextExtraLinks > thisExtraLinks) {
              return {
                text: "Trial $0.00",
                class: "text-orange-500",
                note: `Canceled to add ${
                  nextExtraLinks - thisExtraLinks
                } links`,
                nextPlan: nextSub.planId,
                extraLinksChange: `Added ${
                  nextExtraLinks - thisExtraLinks
                } links`,
              };
            } else if (nextExtraLinks < thisExtraLinks) {
              return {
                text: "Trial $0.00",
                class: "text-orange-500",
                note: `Canceled to remove ${
                  thisExtraLinks - nextExtraLinks
                } links`,
                nextPlan: nextSub.planId,
                extraLinksChange: `Removed ${
                  thisExtraLinks - nextExtraLinks
                } links`,
              };
            }
          }

          return {
            text: "Trial $0.00",
            class: "text-orange-500",
            note: "Canceled for plan change",
            nextPlan: nextSub.planId,
          };
        }
      }

      // If cancelReason already specifies the direction, use it
      if (
        sub.cancelReason === "plan_downgrade" ||
        (sub.metadata && sub.metadata.cancelReason === "plan_downgrade")
      ) {
        return {
          text: `${sub.amount?.toFixed(2) || "0.00"} ${
            sub.currency?.toUpperCase() || "USD"
          }`,
          class: "text-green-600",
          note: "Initial payment (downgraded after)",
          nextPlan: nextSub.planId,
        };
      } else if (
        sub.cancelReason === "plan_upgrade" ||
        (sub.metadata && sub.metadata.cancelReason === "plan_upgrade")
      ) {
        return {
          text: `${sub.amount?.toFixed(2) || "0.00"} ${
            sub.currency?.toUpperCase() || "USD"
          }`,
          class: "text-green-600",
          note: "Initial payment (upgraded after)",
          nextPlan: nextSub.planId,
        };
      } else if (
        sub.cancelReason === "extra_links_increase" ||
        (sub.metadata && sub.metadata.cancelReason === "extra_links_increase")
      ) {
        const nextExtraLinks = nextSub.extraLinks || 0;
        const thisExtraLinks = sub.extraLinks || 0;
        return {
          text: `${sub.amount?.toFixed(2) || "0.00"} ${
            sub.currency?.toUpperCase() || "USD"
          }`,
          class: "text-green-600",
          note: `Initial payment (added ${
            nextExtraLinks - thisExtraLinks
          } links after)`,
          nextPlan: nextSub.planId,
          extraLinksChange: `Added ${nextExtraLinks - thisExtraLinks} links`,
        };
      } else if (
        sub.cancelReason === "extra_links_decrease" ||
        (sub.metadata && sub.metadata.cancelReason === "extra_links_decrease")
      ) {
        const nextExtraLinks = nextSub.extraLinks || 0;
        const thisExtraLinks = sub.extraLinks || 0;
        return {
          text: `${sub.amount?.toFixed(2) || "0.00"} ${
            sub.currency?.toUpperCase() || "USD"
          }`,
          class: "text-green-600",
          note: `Initial payment (removed ${
            thisExtraLinks - nextExtraLinks
          } links after)`,
          nextPlan: nextSub.planId,
          extraLinksChange: `Removed ${thisExtraLinks - nextExtraLinks} links`,
        };
      }
      // Otherwise infer from plan IDs
      else if (
        sub.planId?.includes("agency") &&
        nextSub.planId?.includes("creator")
      ) {
        return {
          text: `${sub.amount?.toFixed(2) || "0.00"} ${
            sub.currency?.toUpperCase() || "USD"
          }`,
          class: "text-green-600",
          note: "Initial payment (downgraded after)",
          nextPlan: nextSub.planId,
        };
      } else if (
        sub.planId?.includes("creator") &&
        nextSub.planId?.includes("agency")
      ) {
        return {
          text: `${sub.amount?.toFixed(2) || "0.00"} ${
            sub.currency?.toUpperCase() || "USD"
          }`,
          class: "text-green-600",
          note: "Initial payment (upgraded after)",
          nextPlan: nextSub.planId,
        };
      } else if (sub.planId === nextSub.planId) {
        // Check if it's an extraLinks change
        const nextExtraLinks = nextSub.extraLinks || 0;
        const thisExtraLinks = sub.extraLinks || 0;

        if (nextExtraLinks > thisExtraLinks) {
          return {
            text: `${sub.amount?.toFixed(2) || "0.00"} ${
              sub.currency?.toUpperCase() || "USD"
            }`,
            class: "text-green-600",
            note: `Initial payment (added ${
              nextExtraLinks - thisExtraLinks
            } links after)`,
            nextPlan: nextSub.planId,
            extraLinksChange: `Added ${nextExtraLinks - thisExtraLinks} links`,
          };
        } else if (nextExtraLinks < thisExtraLinks) {
          return {
            text: `${sub.amount?.toFixed(2) || "0.00"} ${
              sub.currency?.toUpperCase() || "USD"
            }`,
            class: "text-green-600",
            note: `Initial payment (removed ${
              thisExtraLinks - nextExtraLinks
            } links after)`,
            nextPlan: nextSub.planId,
            extraLinksChange: `Removed ${
              thisExtraLinks - nextExtraLinks
            } links`,
          };
        } else {
          return {
            text: `${sub.amount?.toFixed(2) || "0.00"} ${
              sub.currency?.toUpperCase() || "USD"
            }`,
            class: "text-green-600",
            note: "Initial payment",
            nextPlan: nextSub.planId,
          };
        }
      } else {
        return {
          text: `${sub.amount?.toFixed(2) || "0.00"} ${
            sub.currency?.toUpperCase() || "USD"
          }`,
          class: "text-green-600",
          note: "Initial payment",
          nextPlan: nextSub.planId,
        };
      }
    }

    return {
      text: `${sub.amount?.toFixed(2) || "0.00"} ${
        sub.currency?.toUpperCase() || "USD"
      }`,
      class: "text-green-600",
      note: "Initial payment",
    };
  }

  // Default case: just show the amount
  if (sub.amount) {
    return {
      text: `${sub.amount.toFixed(2)} ${sub.currency.toUpperCase()}`,
      class: "text-green-600",
    };
  }

  return { text: "N/A", class: "" };
}
